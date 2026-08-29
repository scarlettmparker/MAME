import { useLocation } from "react-router-dom";
import { BreadcrumbProvider } from "@sun/components";
import Nav from "./nav";

type LayoutProps = React.PropsWithChildren;

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  return (
    <BreadcrumbProvider>
      {!pathname.startsWith("/viewer") && <Nav />}
      {children}
    </BreadcrumbProvider>
  );
}
