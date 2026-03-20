# Clario Order Management App

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Dashboard page with KPI cards (total orders, pending orders, completed orders, total revenue) and charts (bar/line graphs showing order trends)
- Make Order page with form: customer name, phone number, address, quantity, product description, and photo upload
- Pending Orders page listing all orders with status 'pending', ability to mark as completed
- Completed Orders page listing all fulfilled orders
- Navigation sidebar with links to all sections
- Role-based access using authorization component
- Photo uploads via blob-storage

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Order data model (id, customerName, phone, address, quantity, description, photoUrl, status, createdAt, revenue)
2. Backend: CRUD operations - createOrder, getOrders, getOrdersByStatus, updateOrderStatus, deleteOrder
3. Backend: Stats query - getDashboardStats (counts, total revenue)
4. Frontend: Sidebar navigation layout
5. Frontend: Dashboard with stat cards and charts (recharts)
6. Frontend: Make Order form with photo upload
7. Frontend: Pending Orders list with complete action
8. Frontend: Completed Orders list
