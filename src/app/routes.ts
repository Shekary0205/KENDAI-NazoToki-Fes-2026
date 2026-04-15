import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import DepartmentSelect from "./components/DepartmentSelect";
import DepartmentStage from "./components/DepartmentStage";
import Battle from "./components/Battle";
import MidBattle from "./components/MidBattle";
import DepartmentComplete from "./components/DepartmentComplete";
import AllComplete from "./components/AllComplete";
import KeywordHub from "./components/KeywordHub";
import KeywordRouteStage from "./components/KeywordRouteStage";
import KeywordMinigame from "./components/KeywordMinigame";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "select",
        Component: DepartmentSelect,
      },
      {
        path: "department/:departmentId/stage/:stageId",
        Component: DepartmentStage,
      },
      {
        path: "department/:departmentId/battle",
        Component: Battle,
      },
      {
        path: "department/:departmentId/midbattle/:battleId",
        Component: MidBattle,
      },
      {
        path: "department/:departmentId/keyword-hub",
        Component: KeywordHub,
      },
      {
        path: "department/:departmentId/keyword/:routeId/stage/:stageId",
        Component: KeywordRouteStage,
      },
      {
        path: "department/:departmentId/keyword/:routeId/minigame",
        Component: KeywordMinigame,
      },
      {
        path: "department/:departmentId/complete",
        Component: DepartmentComplete,
      },
      {
        path: "all-complete",
        Component: AllComplete,
      },
      {
        path: "*",
        Component: Home,
      },
    ],
  },
]);