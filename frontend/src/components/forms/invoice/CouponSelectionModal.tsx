import { useState } from "react";
import { FiSearch, FiTag, FiGift } from "react-icons/fi";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import { useCoupons, type Coupon } from "../../../services/api/couponService";

interface AppliedCoupon extends Coupon {
  appliedAmount: number;
}

interface CouponSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (coupon: Coupon) => void;
  appliedCoupons: AppliedCoupon[];
}

const CouponSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  appliedCoupons,
}: CouponSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCoupons({
    page,
    filter: searchTerm ? { search: searchTerm } : undefined,
  });

  const handleCouponSelect = (coupon: Coupon) => {
    const isAlreadyApplied = appliedCoupons.some((applied) => applied.id === coupon.id);

    if (isAlreadyApplied && !coupon.stackable) {
      alert("Dieser Gutschein ist bereits angewendet und kann nicht gestapelt werden.");
      return;
    }

    onSelect(coupon);
    setSearchTerm("");
    setPage(1);
  };

  const getCouponTypeInfo = (coupon: Coupon) => {
    if (coupon.price && coupon.price.price > 0) {
      return {
        type: "Geschenkkarte",
        icon: FiGift,
        value: `${coupon.price.price.toFixed(2)} CHF`,
        color: "bg-purple-100 text-purple-800",
      };
    }

    return {
      type: "Gutschein",
      icon: FiTag,
      value:
        coupon.value.type === "percentage"
          ? `${coupon.value.value}%`
          : `${coupon.value.value.toFixed(2)} CHF`,
      color: "bg-blue-100 text-blue-800",
    };
  };

  const isDisabled = (coupon: Coupon) => {
    const isAlreadyApplied = appliedCoupons.some((applied) => applied.id === coupon.id);
    return isAlreadyApplied && !coupon.stackable;
  };

  const filteredCoupons = data?.data.filter((coupon) => coupon.status === "active") || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gutschein auswählen">
      <div className="space-y-4">
        <div className="relative">
          <FiSearch className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" />
          <input
            type="text"
            placeholder="Gutschein suchen..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="py-2 pr-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="py-4 text-red-500 text-center">
              Fehler beim Laden der Gutscheine
            </div>
          )}

          {!isLoading && !error && filteredCoupons.length === 0 && (
            <div className="py-8 text-gray-500 text-center">
              Keine aktiven Gutscheine gefunden
            </div>
          )}

          {!isLoading && !error && filteredCoupons.length > 0 && (
            <div className="space-y-2">
              {filteredCoupons.map((coupon) => {
                const typeInfo = getCouponTypeInfo(coupon);
                const disabled = isDisabled(coupon);
                const isApplied = appliedCoupons.some(
                  (applied) => applied.id === coupon.id,
                );

                return (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => handleCouponSelect(coupon)}
                    disabled={disabled}
                    className={`w-full p-4 text-left border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      disabled
                        ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                    }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <typeInfo.icon className="text-lg" />
                          <h3 className="font-medium">{coupon.name}</h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                            {typeInfo.type}
                          </span>
                          {coupon.stackable && (
                            <span className="inline-flex bg-green-100 px-2 py-1 rounded-full text-green-800 text-xs">
                              Stapelbar
                            </span>
                          )}
                          {isApplied && (
                            <span className="inline-flex bg-yellow-100 px-2 py-1 rounded-full text-yellow-800 text-xs">
                              Bereits angewendet
                            </span>
                          )}
                        </div>
                        <p className="mb-1 text-gray-600 text-sm">Code: {coupon.code}</p>
                        <p className="font-medium text-gray-800 text-sm">
                          Wert: {typeInfo.value}
                        </p>
                        {coupon.description && (
                          <p className="mt-1 text-gray-500 text-sm">
                            {coupon.description}
                          </p>
                        )}
                        {coupon.minimumSpend && (
                          <p className="mt-1 text-gray-500 text-xs">
                            Mindestbestellwert: {coupon.minimumSpend.toFixed(2)} CHF
                          </p>
                        )}
                        {coupon.expiryDate && (
                          <p className="text-gray-500 text-xs">
                            Gültig bis:{" "}
                            {new Date(coupon.expiryDate).toLocaleDateString("de-CH")}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {data && data.total > (data.limit || 10) && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-gray-500 text-sm">
              Seite {page} von {Math.ceil(data.total / (data.limit || 10))}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}>
                Vorherige
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === Math.ceil(data.total / (data.limit || 10))}
                onClick={() => setPage(page + 1)}>
                Nächste
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Schliessen
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CouponSelectionModal;
