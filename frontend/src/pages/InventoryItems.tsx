import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useInventoryItems,
  useCreateInventoryItem,
  type InventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from "../services/api/inventoryItemService";
import Button from "../components/ui/Button";
import InventoryItemForm from "../components/forms/InventoryItemForm";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/ui/Spinner";

const InventoryItems = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<InventoryItem>>({});
  const { data, isLoading, error } = useInventoryItems({ page });
  const createInventoryItem = useCreateInventoryItem();
  const { mutate: updateInventoryItem } = useUpdateInventoryItem();
  const { mutate: deleteInventoryItem } = useDeleteInventoryItem();
  const { showToast } = useToast();

  const formatPrice = (item: InventoryItem) => {
    // Calculate brutto price if it's netto
    let priceValue = item.price.price;
    if (item.price.mwst === "netto" && item.price.mwstPercent !== undefined) {
      priceValue = priceValue * (1 + item.price.mwstPercent / 100);
    }

    let price = `${priceValue.toFixed(2)} CHF`;
    if (item.price.unit) {
      price += ` / ${item.price.unit}`;
    }
    return price;
  };

  const openModal = (itemData?: Partial<InventoryItem>) => {
    setModalData(itemData || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  const handleCreateInventoryItem = async (data: Omit<InventoryItem, "id">) => {
    try {
      await createInventoryItem.mutateAsync(data);
      showToast("Artikel erfolgreich erstellt", "success");
      closeModal();
    } catch (error) {
      console.error("Error creating inventory item:", error);
      showToast("Fehler beim Erstellen des Artikels", "error");
    }
  };

  const handleEditInventoryItem = async (data: Omit<InventoryItem, "id">) => {
    if (!modalData.id) {
      showToast("Artikel konnte nicht bearbeitet werden", "error");
      return;
    }
    updateInventoryItem({ id: modalData.id, data: data });
    showToast("Artikel erfolgreich bearbeitet", "success");
    closeModal();
    setPage(1);
  };

  const handleDeleteInventoryItem = (id: string) => {
    if (window.confirm("Möchten Sie diesen Artikel wirklich löschen?")) {
      deleteInventoryItem(id);
      showToast("Artikel erfolgreich gelöscht", "success");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Inventarartikel werden geladen...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          Fehler beim Laden der Inventarartikel
        </div>
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
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruttopreis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Keine Inventarartikel gefunden
                  </td>
                </tr>
              )}
              {data?.data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{item.name}</div>
                    {item.shortName && (
                      <div className="text-xs text-gray-500">{item.shortName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === "product"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                      {item.type === "product" ? "Produkt" : "Dienstleistung"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{formatPrice(item)}</div>
                    <div className="text-xs text-gray-500">
                      Brutto
                      {item.price.mwstPercent !== undefined &&
                        ` (MWST: ${item.price.mwstPercent}%)`}
                      {item.price.mwst === "netto" && " (umgerechnet)"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.inStockStatus !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {item.inStockStatus !== false ? "Auf Lager" : "Nicht verfügbar"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                          {tag}
                        </span>
                      ))}
                      {!item.tags?.length && <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="outline" onClick={() => openModal(item)}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteInventoryItem(item.id)}>
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
    <Layout name="Inventar">
      <div className="p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventarartikel</h1>
          <Button onClick={() => openModal()}>Neuer Artikel</Button>
        </div>

        {renderContent()}

        <InventoryItemForm
          isOpen={isModalOpen}
          onCancel={closeModal}
          onSubmit={modalData.id ? handleEditInventoryItem : handleCreateInventoryItem}
          initialData={modalData}
          isLoading={createInventoryItem.isPending}
          title={modalData.id ? "Artikel bearbeiten" : "Neuer Artikel"}
        />
      </div>
    </Layout>
  );
};

export default InventoryItems;
