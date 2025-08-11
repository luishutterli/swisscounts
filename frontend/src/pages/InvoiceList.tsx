import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useInvoices,
  useDeleteInvoice,
  type Invoice,
} from "../services/api/invoiceService";
import { useNavigate } from "react-router";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../hooks/useToast";
import { FiPlus, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";

interface PopulatedInvoice extends Omit<Invoice, "customerId"> {
  customerId:
    | {
        name?: string;
        surName?: string;
      }
    | string;
}

const InvoiceList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useInvoices({ page });
  const deleteInvoice = useDeleteInvoice();

  const handleDelete = async (id: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Rechnung löschen möchten?")) {
      try {
        await deleteInvoice.mutateAsync(id);
        showToast("Rechnung erfolgreich gelöscht", "success");
      } catch (error) {
        showToast("Fehler beim Löschen der Rechnung", "error");
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Entwurf";
      case "sent":
        return "Gesendet";
      case "viewed":
        return "Angesehen";
      case "paid":
        return "Bezahlt";
      case "overdue":
        return "Überfällig";
      case "canceled":
        return "Storniert";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-CH");
  };

  const calculateTotal = (invoice: PopulatedInvoice) => {
    return (
      invoice.positions?.reduce((total: number, position) => {
        return total + position.amount * position.settledPrice.price;
      }, 0) || 0
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-8 text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Rechnungen werden geladen...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-8 text-red-500 text-center">
          Fehler beim Laden der Rechnungen
        </div>
      );
    }

    return (
      <>
        <div className="border border-gray-300 rounded-lg overflow-x-auto">
          <table className="divide-y divide-gray-200 min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Rechnung Nr.
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Rechnungsdatum
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Fälligkeitsdatum
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <div className="flex flex-col items-center">
                      <p className="mb-4 text-gray-500">Keine Rechnungen gefunden</p>
                      <Button onClick={() => navigate("/invoices/new")}>
                        <FiPlus className="mr-2" />
                        Erste Rechnung erstellen
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {data?.data.map((invoice: PopulatedInvoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {invoice.invoiceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof invoice.customerId === "string"
                      ? "N/A"
                      : (invoice.customerId as { name?: string; surName?: string })
                          .name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                        invoice.status,
                      )}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(invoice.issuedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(invoice.dueAt)}
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {calculateTotal(invoice).toFixed(2)} CHF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/invoices/${invoice.id}/view`)}>
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-800">
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(data?.data?.length || 0) > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-500 text-sm">
              Seite {page} von{" "}
              {data?.total ? Math.ceil(data.total / (data.limit ?? 10)) : 1}
            </div>
            <div className="flex space-x-2">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
                size="sm">
                Vorherige
              </Button>
              <Button
                disabled={
                  page === (data?.total ? Math.ceil(data.total / (data.limit ?? 10)) : 1)
                }
                onClick={() => setPage(page + 1)}
                variant="outline"
                size="sm">
                Nächste
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout name="Rechnungen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-gray-900 text-2xl">Rechnungen</h1>
          <Button onClick={() => navigate("/invoices/new")}>
            <FiPlus className="mr-2" />
            Neue Rechnung
          </Button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default InvoiceList;
