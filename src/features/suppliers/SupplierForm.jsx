import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/apiFetch";
import { useToast } from "../../app/toast/ToastContext";

export function SupplierForm({ initialValues, onSuccess }) {
  const { pushToast } = useToast();

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
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

    if (!contactName) {
      newErrors.contactName = "Contact name is required";
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
      contactName,
      phone,
      isActive,
    };

    try {
      setIsSubmitting(true);
      const url = isEdit
        ? `/api/suppliers/${initialValues.id}`
        : "/api/suppliers";

      const method = isEdit ? "PUT" : "POST";

      const saved = await apiFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      pushToast({
        type: "success",
        message: isEdit ? "Supplier updated" : "Supplier created",
      });

      if (onSuccess) {
        onSuccess(saved);
      }
    } catch (error) {
      console.log(error);

      pushToast({
        type: "error",
        message: error.message || "Failed to save supplier",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? "");
      setContactName(initialValues.contactName ?? "");
      setPhone(initialValues.phone ?? "");
      setIsActive(Boolean(initialValues.isActive));
      setErrors({});
    } else {
      setName("");
      setContactName("");
      setPhone("");
      setIsActive(true);
      setErrors({});
    }
  }, [initialValues]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Supplier" : "Add Supplier"}
      </h2>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="contactName"
          className="text-sm font-medium text-gray-700"
        >
          Contact Name
        </label>
        <Input
          id="contactName"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />
        {errors.contactName && (
          <p className="text-xs text-red-500">{errors.contactName}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone
        </label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          {isEdit
            ? isSubmitting
              ? "Updating . . ."
              : "Update"
            : isSubmitting
              ? "Saving . . ."
              : "Save"}
        </Button>
      </div>
    </form>
  );
}
