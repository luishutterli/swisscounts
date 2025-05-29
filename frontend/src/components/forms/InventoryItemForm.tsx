import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import type { InventoryItem } from "../../services/api/inventoryItemService";
import { TAX_RATES } from "../../config/constants";

interface InventoryItemFormProps {
  onSubmit: (data: Omit<InventoryItem, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<InventoryItem>;
  isOpen: boolean;
  title: string;
}

const InventoryItemForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  isOpen,
  title,
}: InventoryItemFormProps) => {
  const initialFormData = {
    name: initialData.name ?? "",
    shortName: initialData.shortName ?? "",
    description: initialData.description ?? "",
    type: initialData.type ?? "product",
    price: {
      mwst: initialData.price?.mwst ?? "brutto",
      price: initialData.price?.price ?? 0,
      mwstPercent: initialData.price?.mwstPercent ?? TAX_RATES.DEFAULT_VAT_PERCENT,
      unit: initialData.price?.unit,
    },
    allowAmountDecimal: initialData.allowAmountDecimal ?? false,
    tags: initialData.tags ?? [],
    inStockStatus: initialData.inStockStatus ?? true,
  };

  const [formData, setFormData] = useState<Omit<InventoryItem, "id">>(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      name: initialData.name ?? "",
      shortName: initialData.shortName ?? "",
      description: initialData.description ?? "",
      type: initialData.type ?? "product",
      price: {
        mwst: initialData.price?.mwst ?? "brutto",
        price: initialData.price?.price ?? 0,
        mwstPercent: initialData.price?.mwstPercent ?? TAX_RATES.DEFAULT_VAT_PERCENT,
        unit: initialData.price?.unit,
      },
      allowAmountDecimal: initialData.allowAmountDecimal ?? false,
      tags: initialData.tags ?? [],
      inStockStatus: initialData.inStockStatus ?? true,
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "price") {
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, price: Number.parseFloat(value) || 0 },
      }));
    } else if (name === "mwst") {
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, mwst: value as "brutto" | "netto" },
      }));
    } else if (name === "mwstPercent") {
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, mwstPercent: Number.parseFloat(value) || 0 },
      }));
    } else if (name === "unit") {
      type UnitType =
        | "Stück"
        | "t"
        | "kg"
        | "g"
        | "l"
        | "cl"
        | "ml"
        | "m"
        | "cm"
        | "mm"
        | undefined;
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, unit: (value || undefined) as UnitType },
      }));
    } else if (type === "checkbox") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }

    if (!formData.type) {
      newErrors.type = "Typ ist erforderlich";
    }

    if (formData.price.price <= 0) {
      newErrors.price = "Preis muss größer als 0 sein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setTagInput("");
    setErrors({});
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="lg"
      footer={
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            onClick={() => {
              if (validate()) {
                onSubmit(formData);
              }
            }}>
            Speichern
          </Button>
        </div>
      }>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 h-11 ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="col-span-1">
            <label
              htmlFor="shortName"
              className="block text-sm font-medium text-gray-700">
              Kurzer Name
            </label>
            <input
              type="text"
              id="shortName"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
            />
          </div>

          <div className="col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="col-span-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Typ*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 h-11 ${
                errors.type
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }`}>
              <option value="product">Produkt</option>
              <option value="service">Dienstleistung</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="col-span-1">
            <div className="flex items-center h-full mt-4">
              <input
                type="checkbox"
                id="inStockStatus"
                name="inStockStatus"
                checked={formData.inStockStatus}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="inStockStatus" className="ml-2 block text-sm text-gray-700">
                Auf Lager
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-medium">Preisgestaltung</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="col-span-1">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preis*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price.price}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 h-11 ${
                  errors.price
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary focus:ring-primary"
                }`}
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="mwst" className="block text-sm font-medium text-gray-700">
                MWST
              </label>
              <select
                id="mwst"
                name="mwst"
                value={formData.price.mwst}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11">
                <option value="brutto">Brutto (inkl. MWST)</option>
                <option value="netto">Netto (exkl. MWST)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.price.mwst === "brutto"
                  ? "Der angegebene Preis enthält bereits die MWST"
                  : "Der angegebene Preis ist ohne MWST, diese wird zusätzlich berechnet"}
              </p>
            </div>

            <div className="col-span-1">
              <label
                htmlFor="mwstPercent"
                className="block text-sm font-medium text-gray-700">
                MWST %
              </label>
              <input
                type="number"
                id="mwstPercent"
                name="mwstPercent"
                value={formData.price.mwstPercent}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
                min="0"
                step="0.1"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Einheit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.price.unit || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11">
                <option value="">Keine Einheit</option>
                <option value="Stück">Stück</option>
                <option disabled>-- Gewicht --</option>
                <option value="t">Tonne (t)</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="g">Gramm (g)</option>
                <option disabled>-- Volumen --</option>
                <option value="l">Liter (l)</option>
                <option value="cl">Zentiliter (cl)</option>
                <option value="ml">Milliliter (ml)</option>
                <option disabled>-- Länge --</option>
                <option value="m">Meter (m)</option>
                <option value="cm">Zentimeter (cm)</option>
                <option value="mm">Millimeter (mm)</option>
              </select>
            </div>

            <div className="col-span-1">
              <div className="flex items-center h-full mt-4">
                <input
                  type="checkbox"
                  id="allowAmountDecimal"
                  name="allowAmountDecimal"
                  checked={formData.allowAmountDecimal}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="allowAmountDecimal"
                  className="ml-2 block text-sm text-gray-700">
                  Dezimalmengen erlauben
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-medium">Tags</h4>
          <div className="mt-2">
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Tag hinzufügen..."
                className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="mt-1 inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 sm:text-sm h-11">
                Hinzufügen
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <div
                  key={tag}
                  className="bg-primary/30 text-text px-3 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>
              ))}
              {!formData.tags?.length && (
                <p className="text-sm text-gray-500">Keine Tags vorhanden</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryItemForm;
