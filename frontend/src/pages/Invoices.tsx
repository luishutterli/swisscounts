import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { useNavigate, useParams, useLocation } from "react-router";
import { useToast } from "../hooks/useToast";
import InvoiceForm from "../components/forms/invoice/InvoiceForm";
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
} from "../services/api/invoiceService";
import type { Invoice } from "../services/api/invoiceService";
import Spinner from "../components/ui/Spinner";

const Invoices = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<Invoice>>({
    status: "draft",
    positions: [],
    issuedAt: new Date().toISOString().split("T")[0],
    dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
  });

  const { data: invoiceData, isLoading: isLoadingInvoice } = useInvoice(id || "");
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const isViewMode = location.pathname.includes("/view");
  const isEditMode = location.pathname.includes("/edit");

  const isLoading = isLoadingInvoice && (isViewMode || isEditMode);

  useEffect(() => {
    if (invoiceData && (isViewMode || isEditMode)) {
      const formattedData = {
        ...invoiceData,
        issuedAt: invoiceData.issuedAt
          ? new Date(invoiceData.issuedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueAt: invoiceData.dueAt
          ? new Date(invoiceData.dueAt).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
      setFormData(formattedData);
    }
  }, [invoiceData, isViewMode, isEditMode]);

  const handleSubmit = async (data: Partial<Invoice>) => {
    try {
      if (isEditMode && id) {
        await updateInvoice.mutateAsync({ id, data });
        showToast("Rechnung erfolgreich aktualisiert", "success");
      } else {
        await createInvoice.mutateAsync(data as Omit<Invoice, "id">);
        showToast("Rechnung erfolgreich erstellt", "success");
        navigate("/invoices/list");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showToast(
        `Fehler beim ${isEditMode ? "Aktualisieren" : "Erstellen"} der Rechnung`,
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <Layout name="Rechnung">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const getLayoutTitle = () => {
    if (isViewMode) return "Rechnung anzeigen";
    if (isEditMode) return "Rechnung bearbeiten";
    return "Neue Rechnung";
  };

  return (
    <Layout name={getLayoutTitle()}>
      <div className="mx-auto px-4 py-6 max-w-6xl">
        <InvoiceForm
          initialData={formData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/invoices/list")}
          isLoading={createInvoice.isPending || updateInvoice.isPending}
          readOnly={isViewMode}
        />
      </div>
    </Layout>
  );
};

export default Invoices;
