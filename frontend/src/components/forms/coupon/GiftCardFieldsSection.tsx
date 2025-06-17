import type { Coupon } from "../../../services/api/couponService";

interface GiftCardFieldsSectionProps {
  formData: Omit<Coupon, "id">;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
}

const GiftCardFieldsSection = ({
  formData,
  errors,
  handleChange,
}: GiftCardFieldsSectionProps) => {
  const price = formData.price?.price ?? 0;
  const value = formData.value.value;
  const isPriceGreaterThanValue = price > 0 && value > 0 && price > value;

  return (
    <div className="space-y-4">
      <div className="gap-4 grid grid-cols-2">
        <div>
          <label
            htmlFor="price.price"
            className="block font-medium text-gray-700 text-sm">
            Verkaufspreis (CHF)*
          </label>
          <input
            type="number"
            id="price.price"
            name="price.price"
            min={0}
            step={0.01}
            value={price.toString()}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md border ${
              errors.price || isPriceGreaterThanValue
                ? "border-red-500"
                : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.price && <p className="mt-1 text-red-500 text-sm">{errors.price}</p>}
          <p className="mt-1 text-gray-500 text-xs">Der Preis, den der Kunde bezahlt</p>
        </div>

        <div>
          <label
            htmlFor="value.value"
            className="block font-medium text-gray-700 text-sm">
            Geschenkkarten-Wert (CHF)*
          </label>
          <input
            type="number"
            id="value.value"
            name="value.value"
            min={0}
            step={0.01}
            value={value.toString()}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md border ${
              errors.value || isPriceGreaterThanValue
                ? "border-red-500"
                : "border-gray-300"
            } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
          />
          {errors.value && <p className="mt-1 text-red-500 text-sm">{errors.value}</p>}
          <p className="mt-1 text-gray-500 text-xs">
            Der tatsächliche Wert der Geschenkkarte
          </p>
        </div>
      </div>

      {isPriceGreaterThanValue && (
        <div className="bg-red-50 p-3 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            ⚠️ Der Verkaufspreis ({price.toFixed(2)} CHF) kann nicht grösser als der
            Geschenkkarten-Wert ({value.toFixed(2)} CHF) sein.
          </p>
        </div>
      )}

      {price > 0 && value > 0 && price < value && (
        <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
          <p className="text-blue-600 text-sm">
            💡 Der Kunde bezahlt {price.toFixed(2)} CHF und erhält eine Geschenkkarte im
            Wert von {value.toFixed(2)} CHF (Bonus: {(value - price).toFixed(2)} CHF).
          </p>
        </div>
      )}

      <div>
        <label htmlFor="price.mwst" className="block font-medium text-gray-700 text-sm">
          MwSt-Typ
        </label>
        <select
          id="price.mwst"
          name="price.mwst"
          value={formData.price?.mwst ?? "brutto"}
          onChange={handleChange}
          className="block focus:ring-opacity-50 shadow-sm mt-1 border border-gray-300 focus:border-primary rounded-md focus:ring focus:ring-primary w-full">
          <option value="brutto">Brutto</option>
          <option value="netto">Netto</option>
        </select>
      </div>
    </div>
  );
};

export default GiftCardFieldsSection;
