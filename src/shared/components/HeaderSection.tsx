import { MdAdd } from "react-icons/md";
import { Variant } from "../enums/VariantEnum";
import { Button } from "./Button";

interface Props {
  title: string;
  subTitle: string;
  buttonHide?: boolean;
  buttonLabel: string;
  buttonFunction: () => void;
}

export function HeaderSection({
  title,
  subTitle,
  buttonHide = false,
  buttonLabel,
  buttonFunction
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5 lg:gap-1.5 min-w-0">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">{title}</h1>
        <p className="text-sm text-gray-500 hidden sm:block">
          {subTitle}
        </p>
      </div>
      {!buttonHide && (
        <Button
          variant={Variant.GREEN}
          onClick={buttonFunction}
          className="flex items-center gap-2"
        >
          <MdAdd size={20} />
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}
