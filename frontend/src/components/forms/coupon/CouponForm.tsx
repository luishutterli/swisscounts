import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import type { Coupon, ICouponValue } from "../../../services/api/couponService";
import { TAX_RATES } from "../../../config/constants";
import CouponFieldsSection from "./CouponFieldsSection";
import GiftCardFieldsSection from "./GiftCardFieldsSection";

const generateRandomCode = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

  const part1 = Array.from({ length: 4 }, getRandomChar).join("");
  const part2 = Array.from({ length: 4 }, getRandomChar).join("");

  return `${part1}-${part2}`;
};

const sanitizeCouponCode = (code: string): string => {
  return code
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/\s+/g, "");
};

interface CouponFormProps {
  onSubmit: (data: Omit<Coupon, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Coupon>;
  isOpen: boolean;
  title: string;
}

const CouponForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  isOpen,
  title,
}: CouponFormProps) => {
  const initialCouponValue: ICouponValue = {
    type: initialData.value?.type ?? "fixed",
    value: initialData.value?.value ?? 0,
    maxDiscount: initialData.value?.maxDiscount,
  };

  const initialFormData: Omit<Coupon, "id"> = {
    code: initialData.code ?? "",
    name: initialData.name ?? "",
    description: initialData.description ?? "",
    value: initialCouponValue,
    status: initialData.status ?? "active",
    startDate: initialData.startDate ?? undefined,
    expiryDate: initialData.expiryDate ?? undefined,
    minimumSpend: initialData.minimumSpend ?? undefined,
    applicableItems: initialData.applicableItems ?? [],
    stackable: initialData.stackable ?? false,
    maxUses: initialData.maxUses ?? undefined,
    maxUsesPerCustomer: initialData.maxUsesPerCustomer ?? undefined,
    price: initialData.price,
    state: initialData.state ?? "active",
  };

  const [formData, setFormData] = useState<Omit<Coupon, "id">>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formType, setFormType] = useState<"coupon" | "giftCard">("coupon");

  useEffect(() => {
    if (initialData.price && initialData.price.price > 0) {
      setFormType("giftCard");
    } else {
      setFormType("coupon");
    }

    setFormData({
      code: initialData.code ?? "",
      name: initialData.name ?? "",
      description: initialData.description ?? "",
      value: {
        type: initialData.value?.type ?? "fixed",
        value: initialData.value?.value ?? 0,
        maxDiscount: initialData.value?.maxDiscount,
      },
      status: initialData.status ?? "active",
      startDate: initialData.startDate ?? undefined,
      expiryDate: initialData.expiryDate ?? undefined,
      minimumSpend: initialData.minimumSpend ?? undefined,
      applicableItems: initialData.applicableItems ?? [],
      stackable: initialData.stackable ?? false,
      maxUses: initialData.maxUses ?? undefined,
      maxUsesPerCustomer: initialData.maxUsesPerCustomer ?? undefined,
      price: initialData.price,
      state: initialData.state ?? "active",
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "code") {
      const sanitizedCode = sanitizeCouponCode(value);
      setFormData((prev) => ({ ...prev, code: sanitizedCode }));
    } else if (name === "value.type") {
      setFormData((prev) => ({
        ...prev,
        value: { ...prev.value, type: value as "percentage" | "fixed" },
      }));
    } else if (name === "value.value") {
      setFormData((prev) => ({
        ...prev,
        value: { ...prev.value, value: Number.parseFloat(value) ?? 0 },
      }));
    } else if (name === "value.maxDiscount") {
      setFormData((prev) => ({
        ...prev,
        value: {
          ...prev.value,
          maxDiscount: value ? Number.parseFloat(value) : undefined,
        },
      }));
    } else if (name === "price.price") {
      setFormData((prev) => ({
        ...prev,
        price: prev.price
          ? { ...prev.price, price: Number.parseFloat(value) || 0 }
          : {
              price: Number.parseFloat(value) || 0,
              mwst: "brutto",
              mwstPercent: TAX_RATES.DEFAULT_VAT_PERCENT,
            },
      }));
    } else if (name === "price.mwst") {
      setFormData((prev) => ({
        ...prev,
        price: prev.price
          ? { ...prev.price, mwst: value as "brutto" | "netto" }
          : {
              price: 0,
              mwst: value as "brutto" | "netto",
              mwstPercent: TAX_RATES.DEFAULT_VAT_PERCENT,
            },
      }));
    } else if (name === "price.mwstPercent") {
      setFormData((prev) => ({
        ...prev,
        price: prev.price
          ? { ...prev.price, mwstPercent: Number.parseFloat(value) || 0 }
          : {
              price: 0,
              mwst: "brutto",
              mwstPercent: Number.parseFloat(value) || 0,
            },
      }));
    } else if (type === "checkbox") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else if (name === "minimumSpend") {
      setFormData((prev) => ({
        ...prev,
        minimumSpend: value ? Number.parseFloat(value) : undefined,
      }));
    } else if (name === "maxUses") {
      setFormData((prev) => ({
        ...prev,
        maxUses: value ? Number.parseInt(value) : undefined,
      }));
    } else if (name === "maxUsesPerCustomer") {
      setFormData((prev) => ({
        ...prev,
        maxUsesPerCustomer: value ? Number.parseInt(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateCommonFields = (errors: Record<string, string>) => {
    if (!formData.code) {
      errors.code = "Code ist erforderlich";
    }
    if (!formData.name) {
      errors.name = "Name ist erforderlich";
    }
  };

  const validateCouponFields = (errors: Record<string, string>) => {
    if (formData.value.value <= 0) {
      errors.value = "Wert muss grösser als 0 sein";
    }
    if (formData.value.type === "percentage" && formData.value.value > 100) {
      errors.value = "Prozentwert darf nicht grösser als 100 sein";
    }
    if (formData.value.type === "percentage" && formData.value.value < 0) {
      errors.value = "Prozentwert kann nicht negativ sein";
    }
    if (formData.value.type === "fixed" && formData.value.value < 0) {
      errors.value = "Fester Rabattbetrag kann nicht negativ sein";
    }
    if (
      formData.value.type === "percentage" &&
      formData.value.maxDiscount &&
      formData.value.maxDiscount <= 0
    ) {
      errors.maxDiscount = "Maximaler Rabattbetrag muss grösser als 0 sein";
    }
    if (formData.minimumSpend && formData.minimumSpend < 0) {
      errors.minimumSpend = "Mindestbestellwert kann nicht negativ sein";
    }
    if (formData.maxUses && formData.maxUses <= 0) {
      errors.maxUses = "Maximale Nutzungen muss grösser als 0 sein";
    }
    if (formData.maxUsesPerCustomer && formData.maxUsesPerCustomer <= 0) {
      errors.maxUsesPerCustomer = "Maximale Nutzungen pro Kunde muss grösser als 0 sein";
    }
  };

  const validateGiftCardFields = (errors: Record<string, string>) => {
    if (!formData.price || formData.price.price <= 0) {
      errors.price =
        "Verkaufspreis für die Geschenkkarte ist erforderlich und muss grösser als 0 sein";
    }
    if (formData.value.value <= 0) {
      errors.value = "Geschenkkarten-Wert muss grösser als 0 sein";
    }

    if (formData.price && formData.price.price > 0 && formData.value.value > 0) {
      if (formData.price.price > formData.value.value) {
        errors.price =
          "Verkaufspreis kann nicht grösser als der Geschenkkarten-Wert sein";
      }
    }

    if (formData.price?.mwstPercent && formData.price.mwstPercent < 0) {
      errors.mwstPercent = "MwSt-Prozentsatz kann nicht negativ sein";
    }
  };

  const validateDates = (errors: Record<string, string>) => {
    if (formData.startDate && formData.expiryDate) {
      const startDate = new Date(formData.startDate);
      const expiryDate = new Date(formData.expiryDate);
      if (startDate >= expiryDate) {
        errors.expiryDate = "Ablaufdatum muss nach dem Startdatum liegen";
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    validateCommonFields(newErrors);

    if (formType === "coupon") {
      validateCouponFields(newErrors);
    } else {
      validateGiftCardFields(newErrors);
    }

    validateDates(newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };

      if (formType === "giftCard" && (!submitData.price || submitData.price.price <= 0)) {
        setErrors({ price: "Preis für die Geschenkkarte ist erforderlich" });
        return;
      }

      if (formType === "coupon") {
        const { price: _, ...couponData } = submitData;
        onSubmit(couponData);
      } else {
        submitData.price ??= {
          price: 0,
          mwst: "brutto",
          mwstPercent: TAX_RATES.DEFAULT_VAT_PERCENT,
        };
        onSubmit(submitData);
      }
    }
  };

  const handleTypeChange = (type: "coupon" | "giftCard") => {
    setFormType(type);
  };

  const handleGenerateRandomCode = () => {
    const newCode = generateRandomCode();
    setFormData((prev) => ({ ...prev, code: newCode }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" isLoading={isLoading} onClick={handleSubmit}>
            Speichern
          </Button>
        </div>
      }>
      <form className="space-y-4">
        <div className="flex mb-6 border-b">
          <button
            type="button"
            className={`px-4 py-2 ${formType === "coupon" ? "border-b-2 border-primary font-bold" : ""}`}
            onClick={() => handleTypeChange("coupon")}>
            Gutschein
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${formType === "giftCard" ? "border-b-2 border-primary font-bold" : ""}`}
            onClick={() => handleTypeChange("giftCard")}>
            Geschenkkarte
          </button>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div>
            <label htmlFor="code" className="block font-medium text-gray-700 text-sm">
              Code*
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Code"
                className={`mt-1 block w-full rounded-md border ${
                  errors.code ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
              />
              <button
                type="button"
                onClick={handleGenerateRandomCode}
                className="hover:bg-gray-50 focus:ring-opacity-50 mt-1 px-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                title="Zufälligen Code generieren">
                🎲
              </button>
            </div>
            {errors.code && <p className="mt-1 text-red-500 text-sm">{errors.code}</p>}
            <p className="mt-1 text-gray-500 text-xs">
              Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block font-medium text-gray-700 text-sm">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
            />
            {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 text-sm">
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description ?? ""}
            onChange={handleChange}
            rows={3}
            className="block focus:ring-opacity-50 shadow-sm mt-1 border border-gray-300 focus:border-primary rounded-md focus:ring focus:ring-primary w-full"
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div>
            <label htmlFor="status" className="block font-medium text-gray-700 text-sm">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block focus:ring-opacity-50 shadow-sm mt-1 border border-gray-300 focus:border-primary rounded-md focus:ring focus:ring-primary w-full">
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="used">Benutzt</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="stackable"
              className="block mb-1 font-medium text-gray-700 text-sm">
              Kombinierbar mit anderen Gutscheinen
            </label>
            <input
              type="checkbox"
              id="stackable"
              name="stackable"
              checked={formData.stackable}
              onChange={handleChange}
              className="border-gray-300 rounded focus:ring-primary w-4 h-4 text-primary"
            />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div>
            <label
              htmlFor="startDate"
              className="block font-medium text-gray-700 text-sm">
              Gültig ab
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate ?? ""}
              onChange={handleChange}
              className="block focus:ring-opacity-50 shadow-sm mt-1 border border-gray-300 focus:border-primary rounded-md focus:ring focus:ring-primary w-full"
            />
          </div>

          <div>
            <label
              htmlFor="expiryDate"
              className="block font-medium text-gray-700 text-sm">
              Gültig bis
            </label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate ?? ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.expiryDate ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-red-500 text-sm">{errors.expiryDate}</p>
            )}
          </div>
        </div>

        {formType === "coupon" ? (
          <CouponFieldsSection
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        ) : (
          <GiftCardFieldsSection
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        )}
      </form>
    </Modal>
  );
};

export default CouponForm;
