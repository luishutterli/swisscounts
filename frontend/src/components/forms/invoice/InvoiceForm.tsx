import { useState, useEffect } from "react";
import { FiPlus, FiX, FiSearch, FiUser, FiTag } from "react-icons/fi";
import Button from "../../ui/Button";
import CustomerSelectionModal from "./CustomerSelectionModal";
import CouponSelectionModal from "./CouponSelectionModal";
import InventoryItemSelectionModal from "./InventoryItemSelectionModal";
import InvoicePositionList from "./InvoicePositionList";
import type { Invoice, IInvoicePosition } from "../../../services/api/invoiceService";
import type { Customer } from "../../../services/api/customerService";
import type { Coupon } from "../../../services/api/couponService";
import type { InventoryItem } from "../../../services/api/inventoryItemService";

interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  onSubmit: (data: Partial<Invoice>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

interface AppliedCoupon extends Coupon {
  appliedAmount: number;
}

const InvoiceForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  readOnly = false,
}: InvoiceFormProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [positions, setPositions] = useState<IInvoicePosition[]>([]);
  const [formData, setFormData] = useState({
    description: "",
    text: "",
    notes: "",
    issuedAt: new Date().toISOString().split("T")[0],
    dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "draft" as Invoice["status"],
  });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || "",
        text: initialData.text || "",
        notes: initialData.notes || "",
        issuedAt: initialData.issuedAt || new Date().toISOString().split("T")[0],
        dueAt:
          initialData.dueAt ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: initialData.status || "draft",
      });

      if (initialData.positions) {
        setPositions(initialData.positions);
      }

      if (initialData.customerId && typeof initialData.customerId === "object") {
        setSelectedCustomer(initialData.customerId as Customer);
      }

      if (initialData.appliedCoupons && initialData.appliedCoupons.length > 0) {
        // Since backend populates couponId, we can directly map to AppliedCoupon
        const appliedCouponsWithAmount = initialData.appliedCoupons
          .map((appliedCoupon) => {
            if (
              typeof appliedCoupon.couponId === "object" &&
              appliedCoupon.couponId !== null
            ) {
              const populatedCoupon = appliedCoupon.couponId as unknown as Coupon;
              return {
                ...populatedCoupon,
                appliedAmount: appliedCoupon.discountApplied || 0,
              } as AppliedCoupon;
            }
            return null;
          })
          .filter((item): item is AppliedCoupon => item !== null);

        setAppliedCoupons(appliedCouponsWithAmount);
      }
    }
  }, [initialData]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  };

  const handleCouponSelect = (coupon: Coupon) => {
    // Check if coupon is already applied
    const isAlreadyApplied = appliedCoupons.some((applied) => applied.id === coupon.id);

    if (isAlreadyApplied && !coupon.stackable) {
      alert("Dieser Gutschein ist bereits angewendet und kann nicht gestapelt werden.");
      return;
    }

    const discountAmount = calculateCouponDiscount(coupon);

    const appliedCoupon: AppliedCoupon = {
      ...coupon,
      appliedAmount: discountAmount,
    };

    setAppliedCoupons([...appliedCoupons, appliedCoupon]);
    setShowCouponModal(false);
  };

  const handleInventoryItemSelect = (item: InventoryItem) => {
    // Check if item already exists in positions
    const existingPositionIndex = positions.findIndex(
      (position) => position.inventoryItemId === item.id,
    );

    if (existingPositionIndex !== -1) {
      // Increment existing position amount
      const updatedPositions = [...positions];
      updatedPositions[existingPositionIndex] = {
        ...updatedPositions[existingPositionIndex],
        amount: updatedPositions[existingPositionIndex].amount + 1,
      };
      setPositions(updatedPositions);
    } else {
      // Add new position
      const newPosition: IInvoicePosition = {
        positionId: positions.length + 1,
        amount: 1,
        settledPrice: {
          mwst: item.price.mwst,
          price: item.price.price,
          mwstPercent: item.price.mwstPercent,
          unit: item.price.unit,
        },
        inventoryItemId: item.id,
      };
      setPositions([...positions, newPosition]);
    }

    setShowInventoryModal(false);
  };

  const handlePositionUpdate = (index: number, updatedPosition: IInvoicePosition) => {
    const updatedPositions = [...positions];
    updatedPositions[index] = { ...updatedPosition, positionId: index + 1 };
    setPositions(updatedPositions);
  };

  const handlePositionDelete = (index: number) => {
    const updatedPositions = positions.filter((_, i) => i !== index);
    // Reindex positions
    const reindexedPositions = updatedPositions.map((pos, i) => ({
      ...pos,
      positionId: i + 1,
    }));
    setPositions(reindexedPositions);
  };

  const handleAddCustomPosition = () => {
    const newPosition: IInvoicePosition = {
      positionId: positions.length + 1,
      amount: 1,
      settledPrice: {
        mwst: "brutto",
        price: 0,
        mwstPercent: 7.7,
        unit: "Stück",
      },
      customItem: {
        name: "Benutzerdefinierte Position",
        description: "",
      },
    };

    setPositions([...positions, newPosition]);
  };

  const handleRemoveCoupon = (index: number) => {
    setAppliedCoupons(appliedCoupons.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return positions.reduce((total, position) => {
      return total + position.amount * position.settledPrice.price;
    }, 0);
  };

  const calculateCouponDiscount = (
    coupon: Coupon,
    subtotal: number = calculateSubtotal(),
  ) => {
    if (coupon.value.type === "percentage") {
      return Math.min(
        (subtotal * coupon.value.value) / 100,
        coupon.value.maxDiscount || Number.POSITIVE_INFINITY,
      );
    }
    return Math.min(coupon.value.value, subtotal);
  };

  const calculateTotalDiscount = () => {
    return appliedCoupons.reduce((total, coupon) => total + coupon.appliedAmount, 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateTotalDiscount());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      alert("Bitte wählen Sie einen Kunden aus.");
      return;
    }

    if (positions.length === 0) {
      alert("Bitte fügen Sie mindestens eine Position hinzu.");
      return;
    }

    const invoiceData: Partial<Invoice> = {
      ...formData,
      customerId: selectedCustomer.id,
      positions,
      // Include applied coupons with proper discount calculation
      appliedCoupons: appliedCoupons.map((coupon) => ({
        couponId: coupon.id,
        appliedAt: new Date().toISOString(),
        discountApplied: calculateCouponDiscount(coupon),
      })),
    };

    onSubmit(invoiceData);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-gray-200 border-b">
        <h2 className="font-semibold text-gray-900 text-2xl">
          {initialData?.id ? "Rechnung bearbeiten" : "Neue Rechnung"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Customer Selection Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="flex items-center mb-3 font-medium text-gray-900 text-lg">
            <FiUser className="mr-2" />
            Kunde
          </h3>

          {selectedCustomer ? (
            <div className="flex justify-between items-center bg-white p-3 border rounded">
              <div>
                <p className="font-medium">
                  {selectedCustomer.title ? `${selectedCustomer.title} ` : ""}
                  {selectedCustomer.name} {selectedCustomer.surName}
                </p>
                <p className="text-gray-600 text-sm">{selectedCustomer.email}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerModal(true)}
                  disabled={readOnly}>
                  Ändern
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed">
                  Neuer Kunde
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="flex flex-1 justify-center items-center"
                disabled={readOnly}>
                <FiSearch className="mr-2" />
                Kunde auswählen
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="opacity-50 cursor-not-allowed">
                <FiPlus className="mr-2" />
                Neuer Kunde
              </Button>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-gray-700 text-sm">
              Beschreibung
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={readOnly}
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
              placeholder="Rechnungsbeschreibung"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block mb-2 font-medium text-gray-700 text-sm">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Invoice["status"] })
              }
              disabled={readOnly}
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}>
              <option value="draft">Entwurf</option>
              <option value="sent">Gesendet</option>
              <option value="viewed">Angesehen</option>
              <option value="paid">Bezahlt</option>
              <option value="overdue">Überfällig</option>
              <option value="canceled">Storniert</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="issuedAt"
              className="block mb-2 font-medium text-gray-700 text-sm">
              Rechnungsdatum
            </label>
            <input
              type="date"
              id="issuedAt"
              value={formData.issuedAt}
              onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
              disabled={readOnly}
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
              required
            />
          </div>

          <div>
            <label
              htmlFor="dueAt"
              className="block mb-2 font-medium text-gray-700 text-sm">
              Fälligkeitsdatum
            </label>
            <input
              type="date"
              id="dueAt"
              value={formData.dueAt}
              onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
              disabled={readOnly}
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="text" className="block mb-2 font-medium text-gray-700 text-sm">
            Rechnungstext
          </label>
          <textarea
            id="text"
            rows={3}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            disabled={readOnly}
            className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
              readOnly
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
            placeholder="Zusätzliche Informationen für die Rechnung"
          />
        </div>

        {/* Coupons Section */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="flex items-center font-medium text-gray-900 text-lg">
              <FiTag className="mr-2" />
              Gutscheine ({appliedCoupons.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCouponModal(true)}
              disabled={readOnly}>
              <FiPlus className="mr-2" />
              Gutschein hinzufügen
            </Button>
          </div>

          {appliedCoupons.length === 0 ? (
            <p className="text-gray-600 italic">Keine Gutscheine angewendet</p>
          ) : (
            <div className="space-y-2">
              {appliedCoupons.map((coupon, index) => (
                <div
                  key={`${coupon.id}-${index}`}
                  className="flex justify-between items-center bg-white p-3 border rounded">
                  <div>
                    <span className="font-medium">{coupon.name}</span>
                    <span className="ml-2 text-gray-600 text-sm">({coupon.code})</span>
                    {coupon.stackable && (
                      <span className="inline-flex bg-blue-100 ml-2 px-2 py-1 rounded-full text-blue-800 text-xs">
                        Stapelbar
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-600">
                      -{coupon.appliedAmount.toFixed(2)} CHF
                    </span>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCoupon(index)}>
                        <FiX className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 text-lg">Positionen</h3>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInventoryModal(true)}
                disabled={readOnly}>
                <FiSearch className="mr-2" />
                Aus Inventar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomPosition}
                disabled={readOnly}>
                <FiPlus className="mr-2" />
                Benutzerdefiniert
              </Button>
            </div>
          </div>

          <InvoicePositionList
            positions={positions}
            onPositionUpdate={handlePositionUpdate}
            onPositionDelete={handlePositionDelete}
            readOnly={readOnly}
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Zwischensumme:</span>
              <span className="font-medium">{calculateSubtotal().toFixed(2)} CHF</span>
            </div>
            {appliedCoupons.length > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Rabatt:</span>
                <span className="font-medium">
                  -{calculateTotalDiscount().toFixed(2)} CHF
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Gesamtbetrag:</span>
              <span>{calculateTotal().toFixed(2)} CHF</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block mb-2 font-medium text-gray-700 text-sm">
            Interne Notizen
          </label>
          <textarea
            id="notes"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={readOnly}
            className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-full ${
              readOnly
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
            placeholder="Interne Notizen (nicht sichtbar für den Kunden)"
          />
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedCustomer || positions.length === 0}>
              {(() => {
                if (isLoading) return "Speichern...";
                if (initialData?.id) return "Aktualisieren";
                return "Erstellen";
              })()}
            </Button>
          </div>
        )}

        {readOnly && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Zurück
            </Button>
          </div>
        )}
      </form>

      {/* Modals */}
      <CustomerSelectionModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelect={handleCustomerSelect}
      />

      <CouponSelectionModal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        onSelect={handleCouponSelect}
        appliedCoupons={appliedCoupons}
      />

      <InventoryItemSelectionModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        onSelect={handleInventoryItemSelect}
      />
    </div>
  );
};

export default InvoiceForm;
