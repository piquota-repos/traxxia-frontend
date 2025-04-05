import { useState } from "react";

const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const showToastNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  return {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    setToastMessage,
    setToastVariant,
    showToastNotification
  };
};

export default useToast;