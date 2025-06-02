import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import type { Expense } from "../../services/api/expenseService";

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Expense>;
  isOpen: boolean;
  title: string;
}

const ExpenseForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  isOpen,
  title,
}: ExpenseFormProps) => {
  const initialFormData = {
    description: initialData.description ?? "",
    amount: initialData.amount ?? 0,
    category: initialData.category ?? "",
    date: initialData.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: initialData.notes ?? "",
    receiptImageURL: initialData.receiptImageURL ?? "",
  };

  const [formData, setFormData] = useState<Omit<Expense, "id">>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      description: initialData.description ?? "",
      amount: initialData.amount ?? 0,
      category: initialData.category ?? "",
      date: initialData.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: initialData.notes ?? "",
      receiptImageURL: "",
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Beschreibung ist erforderlich";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Der Betrag muss größer als 0 sein";
    }

    if (!(formData.category ?? "").trim()) {
      newErrors.category = "Kategorie ist erforderlich";
    }

    if (!formData.date) {
      newErrors.date = "Datum ist erforderlich";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const categories = ["Warenaufwand", "Büromaterial", "Technik", "Steuern", "Sonstiges"];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 text-sm">
            Beschreibung *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-red-600 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block font-medium text-gray-700 text-sm">
              Betrag (CHF) *
            </label>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.amount ? "border-red-500" : ""
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-red-600 text-sm">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block font-medium text-gray-700 text-sm">
              Datum *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.date ? "border-red-500" : ""
              }`}
            />
            {errors.date && <p className="mt-1 text-red-600 text-sm">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block font-medium text-gray-700 text-sm">
            Kategorie *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.category ? "border-red-500" : ""
            }`}>
            <option value="">Kategorie wählen</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-red-600 text-sm">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block font-medium text-gray-700 text-sm">
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
