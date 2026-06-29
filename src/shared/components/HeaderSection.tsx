import { MdAdd } from "react-icons/md";
import { Variant } from "../enums/VariantEnum";
import { Button } from "./Button";
import { FabButton } from "./FabButton";

interface Props {
  title: string;
  subTitle: string;
  buttonHide?: boolean;
  buttonLabel: string;
  buttonFunction: (source: HTMLElement) => void;
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
        <>
          <div className="hidden lg:flex">
            <Button
              variant={Variant.GREEN}
              onClick={(e) => buttonFunction(e.currentTarget)}
              className="flex items-center gap-2"
            >
              <MdAdd size={20} />
              {buttonLabel}
            </Button>
          </div>
          <FabButton onClick={(src) => buttonFunction(src)} label={buttonLabel} />
        </>
      )}
    </div>
  )
}
