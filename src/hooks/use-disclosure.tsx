import { useState } from "react";

type UseDisclosureReturn = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

export function useDisclosure(
  initialState: boolean = false
): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const setIsOpenHandler = (isOpen: boolean) => setIsOpen(isOpen);

  return { isOpen, onOpen, onClose, setIsOpen: setIsOpenHandler };
}
