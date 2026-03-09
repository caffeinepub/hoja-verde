import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Timer "mo:core/Timer";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  ////////////////////////////
  // User Profile Management
  ////////////////////////////

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  ////////////////////////////
  // Types and Modules
  ////////////////////////////

  type ClientId = Text;
  type GardenId = Text;
  type ScheduleId = Text;
  type JobId = Nat;
  type QuoteId = Nat;
  type InvoiceId = Nat;
  type ProspectId = Nat;
  type FinancialEntryId = Nat;

  public type Client = {
    id : ClientId;
    name : Text;
    phone : Text;
    address : Text;
    mapLocation : Text;
    notes : Text;
    createdAt : Time.Time;
    isActive : Bool;
  };

  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      Text.compare(client1.id, client2.id);
    };
  };

  public type Garden = {
    clientId : ClientId;
    sizeM2 : Float;
    grassType : Text;
    terrainType : Text;
    toolsRequired : Text;
    avgWorkTimeHours : Float;
    photoUrls : [Text];
    observations : Text;
  };

  module Garden {
    public func compare(garden1 : Garden, garden2 : Garden) : Order.Order {
      Text.compare(garden1.clientId, garden2.clientId);
    };
  };

  public type MaintenanceSchedule = {
    id : ScheduleId;
    clientId : ClientId;
    frequencyDays : Nat;
    lastDate : Text;
    nextDate : Text;
    isActive : Bool;
    notes : Text;
  };

  module MaintenanceSchedule {
    public func compare(schedule1 : MaintenanceSchedule, schedule2 : MaintenanceSchedule) : Order.Order {
      Text.compare(schedule1.id, schedule2.id);
    };
  };

  public type JobStatus = {
    #scheduled;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type Job = {
    id : JobId;
    clientId : ClientId;
    clientName : Text;
    date : Text;
    serviceDescription : Text;
    status : JobStatus;
    notes : Text;
    price : Nat;
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  public type QuoteStatus = {
    #pending;
    #sent;
    #accepted;
    #rejected;
  };

  public type Quote = {
    id : QuoteId;
    clientId : ClientId;
    clientName : Text;
    serviceDescription : Text;
    price : Nat;
    date : Text;
    status : QuoteStatus;
    notes : Text;
  };

  module Quote {
    public func compare(quote1 : Quote, quote2 : Quote) : Order.Order {
      Nat.compare(quote1.id, quote2.id);
    };
  };

  public type Invoice = {
    id : InvoiceId;
    clientId : ClientId;
    clientName : Text;
    services : [Text];
    totalAmount : Nat;
    date : Text;
    nextMaintenanceDate : Text;
    isPaid : Bool;
  };

  module Invoice {
    public func compare(invoice1 : Invoice, invoice2 : Invoice) : Order.Order {
      Nat.compare(invoice1.id, invoice2.id);
    };
  };

  public type ProspectStatus = {
    #pending;
    #quoteSent;
    #accepted;
    #rejected;
  };

  public type Prospect = {
    id : ProspectId;
    name : Text;
    phone : Text;
    address : Text;
    serviceRequested : Text;
    quoteDate : Text;
    status : ProspectStatus;
    notes : Text;
  };

  module Prospect {
    public func compare(prospect1 : Prospect, prospect2 : Prospect) : Order.Order {
      Nat.compare(prospect1.id, prospect2.id);
    };
  };

  public type FinancialEntryType = {
    #income;
    #expense;
  };

  public type FinancialEntry = {
    id : FinancialEntryId;
    entryType : FinancialEntryType;
    amount : Nat;
    category : Text;
    description : Text;
    date : Text;
  };

  module FinancialEntry {
    public func compare(entry1 : FinancialEntry, entry2 : FinancialEntry) : Order.Order {
      Nat.compare(entry1.id, entry2.id);
    };
  };

  ////////////////////////////
  // Data Storage
  ////////////////////////////

  let clients = Map.empty<ClientId, Client>();
  let gardens = Map.empty<ClientId, Garden>();
  let maintenanceSchedules = Map.empty<ScheduleId, MaintenanceSchedule>();
  let jobs = Map.empty<JobId, Job>();
  let quotes = Map.empty<QuoteId, Quote>();
  let invoices = Map.empty<InvoiceId, Invoice>();
  let prospects = Map.empty<ProspectId, Prospect>();
  let financialEntries = Map.empty<FinancialEntryId, FinancialEntry>();

  var nextJobId : JobId = 1;
  var nextQuoteId : QuoteId = 1;
  var nextProspectId : ProspectId = 1;
  var nextFinancialEntryId : FinancialEntryId = 1;
  var nextInvoiceNumber : Nat = 1;

  ////////////////////////////
  // Helper Functions
  ////////////////////////////

  func generateJobId() : JobId {
    let id = nextJobId;
    nextJobId += 1;
    id;
  };

  func generateQuoteId() : QuoteId {
    let id = nextQuoteId;
    nextQuoteId += 1;
    id;
  };

  func generateProspectId() : ProspectId {
    let id = nextProspectId;
    nextProspectId += 1;
    id;
  };

  func generateFinancialEntryId() : FinancialEntryId {
    let id = nextFinancialEntryId;
    nextFinancialEntryId += 1;
    id;
  };

  func generateInvoiceId() : InvoiceId {
    let id = nextInvoiceNumber;
    nextInvoiceNumber += 1;
    id;
  };

  ////////////////////////////
  // Client Management
  ////////////////////////////

  public shared ({ caller }) func createClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create clients");
    };
    if (clients.containsKey(client.id)) {
      Runtime.trap("Client with this ID already exists.");
    };
    clients.add(client.id, client);
  };

  public shared ({ caller }) func updateClient(updatedClient : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };
    if (not clients.containsKey(updatedClient.id)) {
      Runtime.trap("Client not found.");
    };
    clients.add(updatedClient.id, updatedClient);
  };

  public shared ({ caller }) func deleteClient(clientId : ClientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clients");
    };
    if (not clients.containsKey(clientId)) {
      Runtime.trap("Client not found.");
    };
    clients.remove(clientId);
  };

  public query ({ caller }) func getClient(clientId : ClientId) : async Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    switch (clients.get(clientId)) {
      case (?client) { client };
      case (null) { Runtime.trap("Client not found.") };
    };
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray().sort();
  };

  ////////////////////////////
  // Garden Management
  ////////////////////////////

  public shared ({ caller }) func createOrUpdateGarden(garden : Garden) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage gardens");
    };
    gardens.add(garden.clientId, garden);
  };

  public query ({ caller }) func getGardenByClient(clientId : ClientId) : async Garden {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gardens");
    };
    switch (gardens.get(clientId)) {
      case (?garden) { garden };
      case (null) { Runtime.trap("Garden not found for client.") };
    };
  };

  ////////////////////////////
  // Maintenance Schedule Management
  ////////////////////////////

  public shared ({ caller }) func createOrUpdateMaintenanceSchedule(schedule : MaintenanceSchedule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage maintenance schedules");
    };
    maintenanceSchedules.add(schedule.id, schedule);
  };

  public query ({ caller }) func getAllActiveSchedules() : async [MaintenanceSchedule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schedules");
    };
    maintenanceSchedules.values().toArray().sort().filter(func(s) { s.isActive });
  };

  public query ({ caller }) func getUpcomingMaintenance(days : Nat) : async [MaintenanceSchedule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance schedules");
    };
    let upcoming = List.empty<MaintenanceSchedule>();
    for (schedule in maintenanceSchedules.values()) {
      upcoming.add(schedule);
    };
    upcoming.toArray().sort();
  };

  ////////////////////////////
  // Job Management
  ////////////////////////////

  public shared ({ caller }) func createJob(job : Job) : async JobId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    let id = generateJobId();
    let newJob : Job = {
      job with id
    };
    jobs.add(id, newJob);
    id;
  };

  public shared ({ caller }) func updateJob(job : Job) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    if (not jobs.containsKey(job.id)) {
      Runtime.trap("Job not found.");
    };
    jobs.add(job.id, job);
  };

  public shared ({ caller }) func deleteJob(jobId : JobId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete jobs");
    };
    jobs.remove(jobId);
  };

  public query ({ caller }) func getJob(jobId : JobId) : async Job {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    switch (jobs.get(jobId)) {
      case (?job) { job };
      case (null) { Runtime.trap("Job not found.") };
    };
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().sort();
  };

  public shared ({ caller }) func updateJobStatus(jobId : JobId, status : JobStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update job status");
    };
    switch (jobs.get(jobId)) {
      case (?job) {
        let updatedJob : Job = {
          job with status
        };
        jobs.add(jobId, updatedJob);
      };
      case (null) { Runtime.trap("Job not found.") };
    };
  };

  ////////////////////////////
  // Quote Management
  ////////////////////////////

  public shared ({ caller }) func createQuote(quote : Quote) : async QuoteId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create quotes");
    };
    let id = generateQuoteId();
    let newQuote : Quote = {
      quote with id
    };
    quotes.add(id, newQuote);
    id;
  };

  public shared ({ caller }) func updateQuote(quote : Quote) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update quotes");
    };
    if (not quotes.containsKey(quote.id)) {
      Runtime.trap("Quote not found.");
    };
    quotes.add(quote.id, quote);
  };

  public shared ({ caller }) func deleteQuote(quoteId : QuoteId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete quotes");
    };
    quotes.remove(quoteId);
  };

  public shared ({ caller }) func updateQuoteStatus(quoteId : QuoteId, status : QuoteStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update quote status");
    };
    switch (quotes.get(quoteId)) {
      case (?quote) {
        let updatedQuote : Quote = {
          quote with status
        };
        quotes.add(quoteId, updatedQuote);
      };
      case (null) { Runtime.trap("Quote not found.") };
    };
  };

  public query ({ caller }) func getQuoteByStatus(status : QuoteStatus) : async [Quote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };
    quotes.values().toArray().sort().filter(func(q) { q.status == status });
  };

  ////////////////////////////
  // Invoice Management
  ////////////////////////////

  public shared ({ caller }) func createInvoice(invoice : Invoice) : async InvoiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };
    let id = generateInvoiceId();
    let newInvoice : Invoice = {
      invoice with id
    };
    invoices.add(id, newInvoice);
    id;
  };

  public shared ({ caller }) func deleteInvoice(invoiceId : InvoiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete invoices");
    };
    if (not invoices.containsKey(invoiceId)) {
      Runtime.trap("Invoice not found.");
    };
    invoices.remove(invoiceId);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray().sort();
  };

  public query ({ caller }) func getInvoice(invoiceId : InvoiceId) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoices.get(invoiceId)) {
      case (?invoice) { invoice };
      case (null) { Runtime.trap("Invoice not found.") };
    };
  };

  public shared ({ caller }) func markInvoiceAsPaid(invoiceId : InvoiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark invoices as paid");
    };
    switch (invoices.get(invoiceId)) {
      case (?invoice) {
        let updatedInvoice : Invoice = {
          invoice with isPaid = true
        };
        invoices.add(invoiceId, updatedInvoice);
      };
      case (null) { Runtime.trap("Invoice not found.") };
    };
  };

  ////////////////////////////
  // Prospect Management
  ////////////////////////////

  public shared ({ caller }) func createProspect(prospect : Prospect) : async ProspectId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create prospects");
    };
    let id = generateProspectId();
    let newProspect : Prospect = {
      prospect with id
    };
    prospects.add(id, newProspect);
    id;
  };

  public shared ({ caller }) func updateProspect(prospect : Prospect) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update prospects");
    };
    if (not prospects.containsKey(prospect.id)) {
      Runtime.trap("Prospect not found.");
    };
    prospects.add(prospect.id, prospect);
  };

  public shared ({ caller }) func deleteProspect(prospectId : ProspectId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete prospects");
    };
    prospects.remove(prospectId);
  };

  public shared ({ caller }) func updateProspectStatus(prospectId : ProspectId, status : ProspectStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update prospect status");
    };
    switch (prospects.get(prospectId)) {
      case (?prospect) {
        let updatedProspect : Prospect = {
          prospect with status
        };
        prospects.add(prospectId, updatedProspect);
      };
      case (null) { Runtime.trap("Prospect not found.") };
    };
  };

  public query ({ caller }) func getProspectsByStatus(status : ProspectStatus) : async [Prospect] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view prospects");
    };
    prospects.values().toArray().sort().filter(func(p) { p.status == status });
  };

  ////////////////////////////
  // Financial Entry Management
  ////////////////////////////

  public shared ({ caller }) func createFinancialEntry(entry : FinancialEntry) : async FinancialEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create financial entries");
    };
    let id = generateFinancialEntryId();
    let newEntry : FinancialEntry = {
      entry with id
    };
    financialEntries.add(id, newEntry);
    id;
  };

  public shared ({ caller }) func updateFinancialEntry(entry : FinancialEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update financial entries");
    };
    if (not financialEntries.containsKey(entry.id)) {
      Runtime.trap("Financial entry not found.");
    };
    financialEntries.add(entry.id, entry);
  };

  public shared ({ caller }) func deleteFinancialEntry(entryId : FinancialEntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete financial entries");
    };
    financialEntries.remove(entryId);
  };

  public query ({ caller }) func getEntriesByType(entryType : FinancialEntryType) : async [FinancialEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view financial entries");
    };
    financialEntries.values().toArray().sort().filter(func(e) { e.entryType == entryType });
  };
};
