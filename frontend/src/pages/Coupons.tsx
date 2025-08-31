import { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  type Coupon,
} from "../services/api/couponService";
import Button from "../components/ui/Button";
import CouponForm from "../components/forms/coupon/CouponForm";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/ui/Spinner";
import { FiEdit, FiTag, FiGift } from "react-icons/fi";

const Coupons = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<Coupon>>({});
  const { data, isLoading, error } = useCoupons({ page });
  const createCoupon = useCreateCoupon();
  const { mutate: updateCoupon } = useUpdateCoupon();
  const { showToast } = useToast();

  const openModal = (itemData?: Partial<Coupon>) => {
    setModalData(itemData || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  const handleCreateCoupon = async (data: Omit<Coupon, "id">) => {
    try {
      await createCoupon.mutateAsync(data);
      showToast("Gutschein erfolgreich erstellt", "success");
      closeModal();
    } catch (error) {
      console.error("Error creating coupon:", error);
      showToast("Fehler beim Erstellen des Gutscheins", "error");
    }
  };

  const handleEditCoupon = async (data: Omit<Coupon, "id">) => {
    if (!modalData.id) {
      showToast("Gutschein konnte nicht bearbeitet werden", "error");
      return;
    }
    updateCoupon({ id: modalData.id, data: data });
    showToast("Gutschein erfolgreich bearbeitet", "success");
    closeModal();
    setPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("de-CH");
  };

  const getCouponTypeLabel = (coupon: Coupon) => {
    if (coupon.price && coupon.price.price > 0) {
      return "Geschenkkarte";
    }
    return "Gutschein";
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "used") return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = (status: string) => {
    if (status === "active") return "Aktiv";
    if (status === "used") return "Benutzt";
    return "Inaktiv";
  };

  const getCouponValueText = (coupon: Coupon) => {
    if (coupon.price && coupon.price.price > 0) {
      return `${coupon.price.price.toFixed(2)} CHF`;
    }

    if (coupon.value.type === "fixed") {
      return `${coupon.value.value.toFixed(2)} CHF`;
    }

    const percentageText = `${coupon.value.value}%`;
    const maxDiscountText = coupon.value.maxDiscount
      ? ` (Max: ${coupon.value.maxDiscount} CHF)`
      : "";
    return percentageText + maxDiscountText;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-8 text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Gutscheine werden geladen...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-8 text-red-500 text-center">
          Fehler beim Laden der Gutscheine
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
                  Typ
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Wert
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Gültig von
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Gültig bis
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-gray-500 text-center">
                    Keine Gutscheine gefunden
                  </td>
                </tr>
              ) : (
                data?.data.map((coupon: Coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCouponTypeLabel(coupon) === "Geschenkkarte" ? (
                        <div className="flex items-center">
                          <FiGift className="mr-1 text-green-600" />
                          Geschenkkarte
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FiTag className="mr-1 text-blue-600" />
                          Gutschein
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{coupon.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCouponValueText(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(coupon.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(coupon.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(coupon.status)}`}>
                        {getStatusText(coupon.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openModal(coupon)}
                        className="mr-3 text-primary hover:text-primary-dark">
                        <FiEdit className="inline" /> Bearbeiten
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > data.limit && (
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-gray-700 text-sm">
                Seite {data.page} von {Math.ceil(data.total / data.limit)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                Zurück
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === Math.ceil(data.total / data.limit)}
                onClick={() =>
                  setPage((p) => Math.min(p + 1, Math.ceil(data.total / data.limit)))
                }>
                Weiter
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout name="Gutscheine">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-gray-900 text-2xl">Gutscheine und Geschenkkarten</h1>
          <Button onClick={() => openModal()} leftIcon={<FiTag />}>
            Neuen Gutschein erstellen
          </Button>
        </div>

        {renderContent()}

        {isModalOpen && (
          <CouponForm
            isOpen={isModalOpen}
            onCancel={closeModal}
            onSubmit={modalData.id ? handleEditCoupon : handleCreateCoupon}
            initialData={modalData}
            isLoading={createCoupon.isPending}
            title={modalData.id ? "Gutschein bearbeiten" : "Neuen Gutschein erstellen"}
          />
        )}
      </div>
    </Layout>
  );
};

export default Coupons;
