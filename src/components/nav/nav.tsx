import { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@sun/components";
import { RoleCheck } from "@sun/ssr/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import styles from "./nav.module.css";

const PUBLIC_PATHS = ["/login"];

/**
 * Top navigation: page links on the left, admin gear on the right.
 */
const Nav = () => {
  const { t } = useTranslation("nav");
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.link}>
        <Button
          variant={
            pathname === "/" || pathname.startsWith("/bucket")
              ? "default"
              : "secondary"
          }
          className={styles.button}
        >
          {t("buckets")}
        </Button>
      </Link>
      <Suspense fallback={null}>
        <RoleCheck roles={["Admin"]}>
          <Link to="/admin" className={styles.link}>
            <Button
              variant="secondary"
              className={styles.button}
              title={t("admin")}
            >
              <Cog6ToothIcon width={20} height={20} />
            </Button>
          </Link>
        </RoleCheck>
      </Suspense>
      <form action="/__logout" method="post" style={{ marginLeft: "auto" }}>
        <Button type="submit" variant="secondary">
          {t("logout")}
        </Button>
      </form>
    </nav>
  );
};

export default Nav;
