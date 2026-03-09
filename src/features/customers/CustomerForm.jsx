import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/apiFetch";
import { useToast } from "../../app/toast/ToastContext";

export function CustomerForm({ initialValues, onSuccess }) {
  const { pushToast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(initialValues?.id);

  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "Name is required";
    }

    if (!type) {
      newErrors.type = "Type is required";
    }

    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d+$/.test(phone)) {
      newErrors.phone = "Phone is digits only";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name,
      type,
      phone,
      isActive,
    };

    try {
      setIsSubmitting(true);
      const url = isEdit
        ? `/api/customers/${initialValues.id}`
        : "/api/customers";

      const method = isEdit ? "PUT" : "POST";

      const saved = await apiFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      pushToast({
        type: "success",
        message: isEdit ? "Customer updated" : "Customer created",
      });

      if (onSuccess) {
        onSuccess(saved);
      }
    } catch (error) {
      console.error(error);

      pushToast({
        type: "error",
        message: error.message || "Failed to save customer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? "");
      setType(initialValues.type ?? "");
      setPhone(initialValues.phone ?? "");
      setIsActive(Boolean(initialValues.isActive));
      setErrors({});
    } else {
      setName("");
      setType("");
      setPhone("");
      setIsActive(true);
      setErrors({});
    }
  }, [initialValues]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Customer" : "Add Customer"}
      </h2>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium text-gray-700">
          Type
        </label>

        <select
          id="type"
          className="w-full px-3 py-2 rounded border border-gray-300 transition-colors focus:outline-none focus:ring-blue-500 focus:ring-2 focus:border-transparent"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Select Type</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone
        </label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
      </div>

      <label htmlFor="" className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving . . ." : "Save"}
        </Button>
      </div>
    </form>
  );
}
