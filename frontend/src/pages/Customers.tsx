import { useState } from "react";
import Layout from "../components/layout/Layout";
import { useCustomers } from "../services/api/customerService";
import Button from "../components/ui/Button";

const Customers = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCustomers({ page });

  console.log("Customers data", data);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">Failed to load customers</div>
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No customers found
                  </td>
                </tr>
              )}
              {data?.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phone ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.company ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total > data.limit && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span>
              Page {page} of {data && Math.ceil(data.total / data.limit)}
            </span>
            <Button
              variant="outline"
              disabled={!data || page >= Math.ceil(data.total / data.limit)}
              onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout name="Kunden">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kundenliste</h1>
          <Button variant="primary">Neuer Kunde</Button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default Customers;
