import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useCustomers,
  useCreateCustomer,
  type Customer,
} from "../services/api/customerService";
import Button from "../components/ui/Button";
import CustomerForm from "../components/forms/CustomerForm";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/ui/Spinner";

const Customers = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<Customer>>({});
  const { data, isLoading, error } = useCustomers({ page });
  const createCustomer = useCreateCustomer();
  const { showToast } = useToast();

  const getAddressText = (customer: Customer) => {
    if (!customer.address) return "-";
    const { street, postalCode, city } = customer.address;
    return `${street ?? ""} ${postalCode ?? ""} ${city ?? ""}`;
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) setModalData({});
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Kunden werden geladen...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">Fehler beim Laden der Kunden</div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Keine Kunden gefunden
                  </td>
                </tr>
              )}
              {data?.data.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.title ? `${customer.title} ` : ""}
                    {customer.name} {customer.surName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phone ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getAddressText(customer)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement handleEdit functionality for editing customer details
                      }}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement handleDelete functionality for deleting a customer
                      }}>
                      Löschen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Seite {page} von{" "}
            {data?.total ? Math.ceil(data.total / (data.limit ?? 10)) : 1}
          </div>
          <div className="flex space-x-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Vorherige
            </Button>
            <Button
              disabled={
                page === (data?.total ? Math.ceil(data.total / (data.limit ?? 10)) : 1)
              }
              onClick={() => setPage(page + 1)}>
              Nächste
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout name="Kunden">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Kunden</h1>
          <Button onClick={toggleModal}>Neuen Kunden hinzufügen</Button>
        </div>
        {renderContent()}
      </div>
      <CustomerForm
        isOpen={isModalOpen}
        title="Neuen Kunden hinzufügen"
        initialData={modalData}
        onSubmit={async (data: Omit<Customer, "id">) => {
          try {
            // const address = {
            //   street: data.address?.street,
            //   city: data.address?.city,
            //   canton: data.address?.canton,
            //   postalCode: data.address?.postalCode,
            //   country: data.address?.country,
            // };
            // if (
            //   !address.street &&
            //   !address.city &&
            //   !address.canton &&
            //   !address.postalCode &&
            //   !address.country
            // ) {
            //   await createCustomer.mutateAsync(data);
            // } else {
            //   await createCustomer.mutateAsync({ ...data, address });
            // }
            await createCustomer.mutateAsync(data);
            showToast("Kunde erfolgreich erstellt", "success");
            setIsModalOpen(false);
          } catch (error) {
            console.error("Error creating customer:", error);
            showToast("Fehler beim Erstellen des Kunden", "error");
          }
        }}
        onCancel={toggleModal}
      />
    </Layout>
  );
};

export default Customers;
