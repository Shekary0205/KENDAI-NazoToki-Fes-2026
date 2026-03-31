import { Outlet } from "react-router";
import ScrollToTop from "./ScrollToTop";

export default function Root() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
