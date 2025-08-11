import { FiTrash2, FiPackage, FiEdit3 } from "react-icons/fi";
import Button from "../../ui/Button";
import type { IInvoicePosition } from "../../../services/api/invoiceService";
import type { InventoryItem } from "../../../services/api/inventoryItemService";

interface InvoicePositionListProps {
  positions: IInvoicePosition[];
  onPositionUpdate: (index: number, position: IInvoicePosition) => void;
  onPositionDelete: (index: number) => void;
  readOnly?: boolean;
}

const InvoicePositionList = ({
  positions,
  onPositionUpdate,
  onPositionDelete,
  readOnly = false,
}: InvoicePositionListProps) => {
  const handleAmountChange = (index: number, amount: number) => {
    const updatedPosition = { ...positions[index], amount };
    onPositionUpdate(index, updatedPosition);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updatedPosition = {
      ...positions[index],
      settledPrice: { ...positions[index].settledPrice, price },
    };
    onPositionUpdate(index, updatedPosition);
  };

  const handleCustomItemNameChange = (index: number, name: string) => {
    const updatedPosition = {
      ...positions[index],
      customItem: {
        name,
        description: positions[index].customItem?.description || "",
      },
    };
    onPositionUpdate(index, updatedPosition);
  };

  const handleCustomItemDescriptionChange = (index: number, description: string) => {
    const updatedPosition = {
      ...positions[index],
      customItem: {
        name: positions[index].customItem?.name || "",
        description,
      },
    };
    onPositionUpdate(index, updatedPosition);
  };

  const calculatePositionTotal = (position: IInvoicePosition) => {
    return position.amount * position.settledPrice.price;
  };

  if (positions.length === 0) {
    return (
      <div className="p-8 border-2 border-gray-300 border-dashed rounded-lg text-gray-500 text-center">
        <FiPackage className="mx-auto mb-4 text-4xl" />
        <p className="mb-2 font-medium text-lg">Keine Positionen hinzugefügt</p>
        <p className="text-sm">
          Fügen Sie Produkte aus dem Inventar hinzu oder erstellen Sie benutzerdefinierte
          Positionen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-gray-300 border-b">
          <div className="gap-4 grid grid-cols-12 font-medium text-gray-700 text-sm">
            <div className="col-span-1">Pos.</div>
            <div className="col-span-4">Artikel / Beschreibung</div>
            <div className="col-span-2">Menge</div>
            <div className="col-span-2">Einzelpreis</div>
            <div className="col-span-2">Gesamtpreis</div>
            <div className="col-span-1">Aktionen</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {positions.map((position, index) => (
            <div key={`position-${position.positionId}`} className="px-4 py-4">
              <div className="items-start gap-4 grid grid-cols-12">
                {/* Position Number */}
                <div className="flex items-center col-span-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {position.positionId}
                  </span>
                </div>

                {/* Article / Description */}
                <div className="col-span-4">
                  {position.inventoryItemId ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FiPackage className="text-blue-500" />
                        <span className="font-medium text-sm">
                          {typeof position.inventoryItemId === "string"
                            ? "Inventar-Artikel"
                            : (position.inventoryItemId as InventoryItem)?.name ||
                              "Inventar-Artikel"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {typeof position.inventoryItemId === "string"
                          ? `ID: ${position.inventoryItemId}`
                          : `${(position.inventoryItemId as InventoryItem)?.shortName || ""} - ${(position.inventoryItemId as InventoryItem)?.description || ""}`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FiEdit3 className="text-green-500" />
                        <span className="font-medium text-sm">Benutzerdefiniert</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Artikelname"
                        value={position.customItem?.name || ""}
                        onChange={(e) =>
                          handleCustomItemNameChange(index, e.target.value)
                        }
                        disabled={readOnly}
                        className={`px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 w-full text-sm ${
                          readOnly
                            ? "bg-gray-100 cursor-not-allowed"
                            : "focus:ring-blue-500"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Beschreibung (optional)"
                        value={position.customItem?.description || ""}
                        onChange={(e) =>
                          handleCustomItemDescriptionChange(index, e.target.value)
                        }
                        disabled={readOnly}
                        className={`px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 w-full text-sm ${
                          readOnly
                            ? "bg-gray-100 cursor-not-allowed"
                            : "focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <input
                    type="number"
                    min={
                      position.inventoryItemId &&
                      typeof position.inventoryItemId === "object" &&
                      !(position.inventoryItemId as InventoryItem)?.allowAmountDecimal
                        ? "1"
                        : "0.01"
                    }
                    step={
                      position.inventoryItemId &&
                      typeof position.inventoryItemId === "object" &&
                      !(position.inventoryItemId as InventoryItem)?.allowAmountDecimal
                        ? "1"
                        : "0.01"
                    }
                    value={position.amount}
                    onChange={(e) =>
                      handleAmountChange(index, Number.parseFloat(e.target.value) || 0)
                    }
                    disabled={readOnly}
                    className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 w-full text-sm ${
                      readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:ring-blue-500"
                    }`}
                  />
                  {position.settledPrice.unit && (
                    <p className="mt-1 text-gray-500 text-xs">
                      {position.settledPrice.unit}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={position.settledPrice.price}
                      onChange={(e) =>
                        handlePriceChange(index, Number.parseFloat(e.target.value) || 0)
                      }
                      disabled={!!position.inventoryItemId || readOnly}
                      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 w-full text-sm ${
                        position.inventoryItemId || readOnly
                          ? "bg-gray-100 cursor-not-allowed text-gray-600"
                          : "focus:ring-blue-500"
                      }`}
                    />
                    <div className="text-gray-500 text-xs">
                      <span>
                        {position.settledPrice.mwst === "brutto" ? "inkl." : "zzgl."}{" "}
                        MwSt.
                      </span>
                      {position.settledPrice.mwstPercent && (
                        <span> ({position.settledPrice.mwstPercent}%)</span>
                      )}
                      {position.inventoryItemId && (
                        <div className="mt-1 text-gray-500 text-xs">
                          Preis aus Inventar
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center col-span-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {calculatePositionTotal(position).toFixed(2)} CHF
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center col-span-1">
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onPositionDelete(index)}
                      className="text-red-600 hover:text-red-800">
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">
            Anzahl Positionen: <span className="font-medium">{positions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePositionList;
