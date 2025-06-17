import type { Coupon } from "../../../services/api/couponService";

interface CouponFieldsSectionProps {
  formData: Omit<Coupon, "id">;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
}

const CouponFieldsSection = ({
  formData,
  errors,
  handleChange,
}: CouponFieldsSectionProps) => {
  return (
    <>
      <div className="gap-4 grid grid-cols-2">
        <div>
          <label htmlFor="value.type" className="block font-medium text-gray-700 text-sm">
            Rabattart*
          </label>
          <select
            id="value.type"
            name="value.type"
            value={formData.value.type}
            onChange={handleChange}
            className="block focus:ring-opacity-50 shadow-sm mt-1 border border-gray-300 focus:border-primary rounded-md focus:ring focus:ring-primary w-full">
            <option value="fixed">Fester Betrag (CHF)</option>
            <option value="percentage">Prozent (%)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="value.value"
            className="block font-medium text-gray-700 text-sm">
            {formData.value.type === "fixed" ? "Betrag (CHF)*" : "Prozent (%)*"}
          </label>
          <input
            type="number"
            id="value.value"
            name="value.value"
            min={0}
            max={formData.value.type === "percentage" ? 100 : undefined}
            step={formData.value.type === "percentage" ? 1 : 0.01}
            value={formData.value.value}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md border ${
              errors.value ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.value && <p className="mt-1 text-red-500 text-sm">{errors.value}</p>}
        </div>
      </div>

      {formData.value.type === "percentage" && (
        <div>
          <label
            htmlFor="value.maxDiscount"
            className="block font-medium text-gray-700 text-sm">
            Maximaler Rabattbetrag (CHF)
          </label>
          <input
            type="number"
            id="value.maxDiscount"
            name="value.maxDiscount"
            min={0}
            step={0.01}
            value={formData.value.maxDiscount ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.maxDiscount ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.maxDiscount && (
            <p className="mt-1 text-red-500 text-sm">{errors.maxDiscount}</p>
          )}
        </div>
      )}

      <div className="gap-4 grid grid-cols-2">
        <div>
          <label
            htmlFor="minimumSpend"
            className="block font-medium text-gray-700 text-sm">
            Mindestbestellwert (CHF)
          </label>
          <input
            type="number"
            id="minimumSpend"
            name="minimumSpend"
            min={0}
            step={0.01}
            value={formData.minimumSpend ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.minimumSpend ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.minimumSpend && (
            <p className="mt-1 text-red-500 text-sm">{errors.minimumSpend}</p>
          )}
        </div>

        <div>
          <label htmlFor="maxUses" className="block font-medium text-gray-700 text-sm">
            Maximale Nutzungen
          </label>
          <input
            type="number"
            id="maxUses"
            name="maxUses"
            min={0}
            step={1}
            value={formData.maxUses ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.maxUses ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.maxUses && (
            <p className="mt-1 text-red-500 text-sm">{errors.maxUses}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="maxUsesPerCustomer"
          className="block font-medium text-gray-700 text-sm">
          Maximale Nutzungen pro Kunde
        </label>
        <input
          type="number"
          id="maxUsesPerCustomer"
          name="maxUsesPerCustomer"
          min={0}
          step={1}
          value={formData.maxUsesPerCustomer ?? ""}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.maxUsesPerCustomer ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
        />
        {errors.maxUsesPerCustomer && (
          <p className="mt-1 text-red-500 text-sm">{errors.maxUsesPerCustomer}</p>
        )}
      </div>
    </>
  );
};

export default CouponFieldsSection;
