import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import BlobStorage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  type Order = {
    id : Nat;
    customerName : Text;
    phone : Text;
    address : Text;
    quantity : Nat;
    description : Text;
    photo : BlobStorage.ExternalBlob;
    status : OrderStatus;
    createdAt : Int;
    revenue : Float;
  };

  type OrderStats = {
    totalOrders : Nat;
    pendingCount : Nat;
    completedCount : Nat;
    totalRevenue : Float;
  };

  type OrderStatus = {
    #pending;
    #completed;
  };

  public type UserProfile = {
    name : Text;
  };

  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func isAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Order management functions
  public shared ({ caller }) func createOrder(customerName : Text, phone : Text, address : Text, quantity : Nat, description : Text, photo : BlobStorage.ExternalBlob, revenue : Float) : async Nat {
    isAdmin(caller);

    let id = orders.size();
    let time = Time.now() / 1_000_000_000;

    let order : Order = {
      id;
      customerName;
      phone;
      address;
      quantity;
      description;
      photo;
      status = #pending;
      createdAt = time;
      revenue;
    };
    orders.add(id, order);
    id;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    isAdmin(caller);
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    isAdmin(caller);
    let filteredList = List.empty<Order>();
    for (order in orders.values()) {
      if (order.status == status) {
        filteredList.add(order);
      };
    };
    filteredList.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat) : async () {
    isAdmin(caller);
    let order = switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?found) { found };
    };

    let updatedOrder = { order with status = #completed };
    orders.add(id, updatedOrder);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    isAdmin(caller);
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?_) {
        orders.remove(id);
      };
    };
  };

  public query ({ caller }) func getDashboardStats() : async OrderStats {
    isAdmin(caller);
    var totalOrders = 0;
    var pendingCount = 0;
    var completedCount = 0;
    var totalRevenue = 0.0;

    for (order in orders.values()) {
      totalOrders += 1;
      switch (order.status) {
        case (#pending) { pendingCount += 1 };
        case (#completed) { completedCount += 1 };
      };
      totalRevenue += order.revenue;
    };

    {
      totalOrders;
      pendingCount;
      completedCount;
      totalRevenue;
    };
  };
};
