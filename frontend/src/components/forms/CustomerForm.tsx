import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import type { Customer } from "../../services/api/";

interface CustomerFormProps {
  onSubmit: (data: Omit<Customer, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Customer>;
  isOpen: boolean;
  title: string;
}

const CustomerForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  isOpen,
  title,
}: CustomerFormProps) => {
  const [formData, setFormData] = useState<Omit<Customer, "id">>({
    title: initialData.title ?? undefined,
    name: initialData.name ?? "",
    surName: initialData.surName ?? "",
    email: initialData.email ?? "",
    phone: initialData.phone ?? "",
    address: {
      street: initialData.address?.street ?? "",
      city: initialData.address?.city ?? "",
      canton: initialData.address?.canton ?? "",
      postalCode: initialData.address?.postalCode ?? "",
      country: initialData.address?.country ?? "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (
      name === "street" ||
      name === "city" ||
      name === "canton" ||
      name === "postalCode" ||
      name === "country"
    ) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }

    if (!formData.surName.trim()) {
      newErrors.surName = "Nachname ist erforderlich";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setFormData({
      title: initialData.title ?? undefined,
      name: initialData.name ?? "",
      surName: initialData.surName ?? "",
      email: initialData.email ?? "",
      phone: initialData.phone ?? "",
      address: {
        street: initialData.address?.street ?? "",
        city: initialData.address?.city ?? "",
        canton: initialData.address?.canton ?? "",
        postalCode: initialData.address?.postalCode ?? "",
        country: initialData.address?.country ?? "",
      },
    });
    setErrors({});
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Anrede
            </label>
            <select
              id="title"
              name="title"
              value={formData.title ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11">
              <option value="">Bitte wählen</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
            </select>
          </div>

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
            <label htmlFor="surName" className="block text-sm font-medium text-gray-700">
              Nachname*
            </label>
            <input
              type="text"
              id="surName"
              name="surName"
              value={formData.surName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 h-11 ${
                errors.surName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.surName && (
              <p className="mt-1 text-sm text-red-600">{errors.surName}</p>
            )}
          </div>

          <div className="col-span-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 h-11 ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="col-span-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Adresse</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Strasse
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.address?.street}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
            </div>

            <div className="col-span-1">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700">
                PLZ
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.address?.postalCode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Ort
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address?.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="canton" className="block text-sm font-medium text-gray-700">
                Kanton
              </label>
              <input
                type="text"
                id="canton"
                name="canton"
                value={formData.address?.canton}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
            </div>

            <div className="col-span-1">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700">
                Land
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.address?.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 h-11"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
