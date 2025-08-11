import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import { useCustomers, type Customer } from "../../../services/api/customerService";

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const CustomerSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
}: CustomerSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCustomers({
    page,
    filter: searchTerm ? { search: searchTerm } : undefined,
  });

  const handleCustomerSelect = (customer: Customer) => {
    onSelect(customer);
    setSearchTerm("");
    setPage(1);
  };

  const filteredCustomers = data?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kunde auswählen">
      <div className="space-y-4">
        <div className="relative">
          <FiSearch className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" />
          <input
            type="text"
            placeholder="Kunde suchen..."
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
              Fehler beim Laden der Kunden
            </div>
          )}

          {!isLoading && !error && filteredCustomers.length === 0 && (
            <div className="py-8 text-gray-500 text-center">Keine Kunden gefunden</div>
          )}

          {!isLoading && !error && filteredCustomers.length > 0 && (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="hover:bg-gray-50 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {customer.title ? `${customer.title} ` : ""}
                        {customer.name} {customer.surName}
                      </h3>
                      <p className="text-gray-600 text-sm">{customer.email}</p>
                      {customer.address && (
                        <p className="text-gray-500 text-sm">
                          {customer.address.street}, {customer.address.postalCode}{" "}
                          {customer.address.city}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {data && data.total > data.limit && (
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-gray-700 text-sm">
              {(page - 1) * data.limit + 1} - {Math.min(page * data.limit, data.total)}{" "}
              von {data.total}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}>
                Zurück
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page * data.limit >= data.total}>
                Weiter
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomerSelectionModal;
