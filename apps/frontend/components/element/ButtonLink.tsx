import { type ButtonVariant, buttonStyles } from "@/components/element/Button"
import { Link } from "@remix-run/react"
import { clsx } from "clsx"

type ButtonLinkProps = {
  variant?: ButtonVariant | undefined
} & React.ComponentPropsWithoutRef<typeof Link>

const ButtonLink: React.FC<ButtonLinkProps> = ({
  children,
  className,
  variant,
  ...rest
}) => {
  return (
    <Link
      className={buttonStyles({
        className: clsx("inline-block", className),
        ...variant,
      })}
      {...rest}
    >
      {children}
    </Link>
  )
}

export default ButtonLink
