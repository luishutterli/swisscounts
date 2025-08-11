import { useState } from "react";
import { FiSearch, FiPackage, FiTool } from "react-icons/fi";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import {
  useInventoryItems,
  type InventoryItem,
} from "../../../services/api/inventoryItemService";

interface InventoryItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: InventoryItem) => void;
}

const InventoryItemSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
}: InventoryItemSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useInventoryItems({
    page,
    filter: searchTerm ? { search: searchTerm } : undefined,
  });

  const handleItemSelect = (item: InventoryItem) => {
    onSelect(item);
    setSearchTerm("");
    setTypeFilter("all");
    setPage(1);
  };

  const getTypeIcon = (type: string) => {
    return type === "product" ? FiPackage : FiTool;
  };

  const getTypeLabel = (type: string) => {
    return type === "product" ? "Produkt" : "Dienstleistung";
  };

  const getTypeColor = (type: string) => {
    return type === "product"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const filteredItems =
    data?.data.filter((item) => typeFilter === "all" || item.type === typeFilter) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Produkt/Dienstleistung auswählen">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <FiSearch className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="Produkt oder Dienstleistung suchen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="py-2 pr-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant={typeFilter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}>
              Alle
            </Button>
            <Button
              type="button"
              variant={typeFilter === "product" ? "primary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("product")}>
              Produkte
            </Button>
            <Button
              type="button"
              variant={typeFilter === "service" ? "primary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("service")}>
              Dienstleistungen
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="py-4 text-red-500 text-center">
              Fehler beim Laden der Artikel
            </div>
          )}

          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="py-8 text-gray-500 text-center">Keine Artikel gefunden</div>
          )}

          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className="hover:bg-gray-50 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <TypeIcon className="text-lg" />
                          <h3 className="font-medium">{item.name}</h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                            {getTypeLabel(item.type)}
                          </span>
                          {item.inStockStatus === false && (
                            <span className="inline-flex bg-red-100 px-2 py-1 rounded-full text-red-800 text-xs">
                              Nicht verfügbar
                            </span>
                          )}
                        </div>

                        {item.shortName && (
                          <p className="mb-1 text-gray-600 text-sm">
                            Kurz: {item.shortName}
                          </p>
                        )}

                        {item.description && (
                          <p className="mb-2 text-gray-600 text-sm">{item.description}</p>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">
                              {item.price.price.toFixed(2)} CHF
                            </span>
                            <span className="text-gray-500 text-sm">
                              {item.price.mwst === "brutto" ? "inkl." : "zzgl."} MwSt.
                              {item.price.mwstPercent
                                ? ` (${item.price.mwstPercent}%)`
                                : ""}
                            </span>
                            {item.price.unit && (
                              <span className="text-gray-500 text-sm">
                                pro {item.price.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
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

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Schliessen
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryItemSelectionModal;
