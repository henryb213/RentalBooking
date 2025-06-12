import Link from "next/link";
import Button, { ButtonProps } from "./button";

export interface LinkButtonProps extends ButtonProps {
  href: string;
}

const LinkButton = ({ href, children, ...props }: LinkButtonProps) => {
  return (
    <Button asChild {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
};

LinkButton.displayName = "LinkButton";

export default LinkButton;
