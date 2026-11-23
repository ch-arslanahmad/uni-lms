// All-Users view backed by the shared admin store (CSV imports show up here).
import UsersPage from "./UsersPage";
import { UserColumns, UserFilters, UserSearchKeys } from "../../components/userTableConfig";
import { useAdminStore } from "../../lib/adminStore";

function AllUsersPage() {
  const store = useAdminStore();
  return (
    <UsersPage
      title="Users"
      data={store.users}
      columns={UserColumns}
      searchKeys={UserSearchKeys}
      filters={UserFilters}
    />
  );
}

export default AllUsersPage;
