import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";


export default function AdminPanel() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Manage Users",
      desc: "Add users",
      icon: "bi-people",
      route: "/signup"
    },
    {
      title: "Users List",
      desc: "List of users",
      icon: "bi-building",
      route: "/users"
    },
    {
      title: "Roles & Permissions",
      desc: "Set user access levels",
      icon: "bi-shield-lock",
      route: "/roles"
    },
    {
      title: "High Priority Requests",
      desc: "Approve priority file requests",
      icon: "bi-exclamation-circle",
      route: "/highpriority"
    },
    {
      title: "Red List Files",
      desc: "Monitor red list files and Reset file expiry timer",
      icon: "bi-lightning-charge",
      route: "/redlist"
    },
    // {
    //   title: "Reset Timer",
    //   desc: "Reset file expiry timers",
    //   icon: "bi-clock-history",
    //   route: "/reset-timer"
    // },
    // {
    //   title: "Reports",
    //   desc: "Download and view file reports",
    //   icon: "bi-bar-chart",
    //   route: "/reports"
    // },
  ];

  return (
    <div className="d-flex">
  {/* Sidebar Area */}
  <Sidebar />

  {/* Main Content Area */}
  <div className="flex-grow-1 p-4">
    <h3 className="mb-4 fw-bold">Admin Panel</h3>

    <div className="row g-4">
      {cards.map((card, index) => (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
          <div
            className="card dashboard-card shadow-sm p-3 h-100"
            onClick={() => navigate(card.route)}
            style={{ cursor: "pointer" }}
          >
            <div className="text-center mb-3">
              <i className={`bi ${card.icon} fs-1 text-primary`}></i>
            </div>
            <h5 className="text-center">{card.title}</h5>
            <p className="text-muted text-center small">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  );
}
