import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useExpenses,
  useCreateExpense,
  type Expense,
  useUpdateExpense,
  useDeleteExpense,
} from "../services/api/expenseService";
import Button from "../components/ui/Button";
import ExpenseForm from "../components/forms/ExpenseForm";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/ui/Spinner";

const Expenses = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<Expense>>({});
  const { data, isLoading, error } = useExpenses({ page });
  const createExpense = useCreateExpense();
  const { mutate: updateExpense } = useUpdateExpense();
  const { mutate: deleteExpense } = useDeleteExpense();
  const { showToast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  const openModal = (expenseData?: Partial<Expense>) => {
    setModalData(expenseData || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  const handleCreateExpense = async (data: Omit<Expense, "id">) => {
    try {
      await createExpense.mutateAsync(data);
      showToast("Ausgabe erfolgreich erstellt", "success");
      closeModal();
    } catch (error) {
      console.error("Error creating expense:", error);
      showToast("Fehler beim Erstellen der Ausgabe", "error");
    }
  };

  const handleEditExpense = async (data: Omit<Expense, "id">) => {
    if (!modalData.id) {
      showToast("Ausgabe konnte nicht bearbeitet werden", "error");
      return;
    }
    updateExpense({ id: modalData.id, data: data });
    showToast("Ausgabe erfolgreich bearbeitet", "success");
    closeModal();
    setPage(1);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Möchten Sie diese Ausgabe wirklich löschen?")) {
      deleteExpense(id);
      showToast("Ausgabe erfolgreich gelöscht", "success");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-8 text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Ausgaben werden geladen...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-8 text-red-500 text-center">
          Fehler beim Laden der Ausgaben
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
                  Beschreibung
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    Keine Ausgaben gefunden
                  </td>
                </tr>
              )}
              {data?.data.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {expense.description}
                    </div>
                    {expense.notes && (
                      <div className="max-w-xs text-gray-500 text-xs truncate">
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-sm">{formatAmount(expense.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{formatDate(expense.date)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-800 text-xs leading-5">
                      {expense.category}
                    </span>
                  </td>
                  <td className="space-x-2 px-6 py-4 whitespace-nowrap">
                    <Button variant="outline" onClick={() => openModal(expense)}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteExpense(expense.id)}>
                      Löschen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-500 text-sm">
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
    <Layout name="Ausgaben">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-semibold text-gray-900 text-2xl">Ausgaben</h1>
          <Button onClick={() => openModal()}>Neue Ausgabe hinzufügen</Button>
        </div>
        {renderContent()}
      </div>
      <ExpenseForm
        isOpen={isModalOpen}
        title={modalData.id ? "Ausgabe bearbeiten" : "Neue Ausgabe hinzufügen"}
        initialData={modalData}
        onSubmit={async (data: Omit<Expense, "id">) => {
          if (modalData.id) handleEditExpense(data);
          else handleCreateExpense(data);
        }}
        onCancel={closeModal}
        isLoading={createExpense.isPending}
      />
    </Layout>
  );
};

export default Expenses;
