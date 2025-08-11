import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useBookkeepingEntries,
  useBookkeepingSummary,
  formatCurrency,
  formatDate,
  type BookkeepingEntry,
} from "../services/api/bookkeepingService";
import Spinner from "../components/ui/Spinner";

const Bookkeeping = () => {
  const [page, setPage] = useState(1);
  const {
    data: entriesData,
    isLoading: entriesLoading,
    error: entriesError,
  } = useBookkeepingEntries({ page });
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useBookkeepingSummary();

  // Log any errors for debugging
  if (entriesError) {
    console.error("Entries error:", entriesError);
  }
  if (summaryError) {
    console.error("Summary error:", summaryError);
  }

  const renderSummaryCard = () => {
    if (summaryLoading) {
      return (
        <div className="bg-white shadow-sm mb-6 p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-center items-center h-20">
            <Spinner size="md" />
          </div>
        </div>
      );
    }

    if (!summaryData) return null;

    const isProfit = summaryData.netAmount >= 0;

    return (
      <div className="bg-white shadow-sm mb-6 p-6 border border-gray-200 rounded-lg">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">Finanzübersicht</h2>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <div className="text-center">
            <p className="mb-1 text-gray-600 text-sm">Gesamte Einnahmen</p>
            <p className="font-bold text-green-600 text-2xl">
              {formatCurrency(summaryData.totalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-gray-600 text-sm">Gesamte Ausgaben</p>
            <p className="font-bold text-red-600 text-2xl">
              {formatCurrency(summaryData.totalExpenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-gray-600 text-sm">Gewinn / Verlust</p>
            <p
              className={`text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : ""}
              {formatCurrency(summaryData.netAmount)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (entriesLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-8 text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Buchungen werden geladen...</p>
        </div>
      );
    }

    if (entriesError) {
      console.log("Bookkeeping entries error:", entriesError);
      return (
        <div className="py-8 text-red-500 text-center">
          Fehler beim Laden der Buchungen
          <div className="mt-2 text-gray-600 text-sm">
            {entriesError.message || "Unbekannter Fehler"}
          </div>
        </div>
      );
    }

    if (!entriesData || entriesData.data.length === 0) {
      return (
        <div className="py-8 text-gray-500 text-center">Keine Buchungen vorhanden</div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="bg-white border border-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Beschreibung
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
                Einnahmen
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
                Ausgaben
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
                Typ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entriesData.data.map((entry: BookkeepingEntry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 text-gray-900 text-sm">
                  <div>
                    {entry.description}
                    {entry.category && (
                      <span className="block mt-1 text-gray-500 text-xs">
                        Kategorie: {entry.category}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                  {entry.type === "income" ? (
                    <span className="font-medium text-green-600">
                      {formatCurrency(entry.amount)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                  {entry.type === "expense" ? (
                    <span className="font-medium text-red-600">
                      {formatCurrency(entry.amount)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {entry.type === "income" ? "Einnahme" : "Ausgabe"}
                  </span>
                  <div className="mt-1 text-gray-500 text-xs">
                    {entry.sourceType === "invoice" ? "Rechnung" : "Ausgabe"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (!entriesData?.pagination) return null;

    const { page: currentPage, totalPages } = entriesData.pagination;
    const pageNumbers = [];

    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-between items-center bg-white mt-4 px-4 sm:px-6 py-3 border-gray-200 border-t">
        <div className="sm:hidden flex flex-1 justify-between">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm">
            Zurück
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 ml-3 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm">
            Weiter
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:justify-between sm:items-center">
          <div>
            <p className="text-gray-700 text-sm">
              Zeige <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> bis{" "}
              <span className="font-medium">
                {Math.min(currentPage * 10, entriesData.pagination.total)}
              </span>{" "}
              von <span className="font-medium">{entriesData.pagination.total}</span>{" "}
              Einträgen
            </p>
          </div>
          <div>
            <nav className="inline-flex isolate -space-x-px shadow-sm rounded-md">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="inline-flex relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-l-md focus:outline-offset-0 ring-1 ring-gray-300 ring-inset text-gray-400">
                ‹
              </button>
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                    pageNum === currentPage ? "bg-primary text-white" : "text-gray-900"
                  }`}>
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-r-md focus:outline-offset-0 ring-1 ring-gray-300 ring-inset text-gray-400">
                ›
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout name="Buchhaltung">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-bold text-gray-900 text-2xl">Buchhaltung</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Übersicht über alle Einnahmen und Ausgaben
          </p>
        </div>

        {renderSummaryCard()}

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-gray-200 border-b">
            <h2 className="font-semibold text-gray-900 text-lg">Alle Transaktionen</h2>
          </div>
          {renderTable()}
          {renderPagination()}
        </div>
      </div>
    </Layout>
  );
};

export default Bookkeeping;
