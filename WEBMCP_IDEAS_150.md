# WebMCP Challenge: 150 App Ideas

Generated on 2026-08-26 by five independent OpenCode sessions using `opencode-go/ox-alpha-free`. Each agent produced exactly 30 ideas in a separate opportunity space, including a human-agent collaboration loop, concrete WebMCP tools, browser-native rationale, a sub-three-minute demo beat, and an execution risk.

The ideas below are raw ideation output. See `WEBMCP_SHORTLIST.md` for the cross-agent evaluation and recommendation.

---

## Batch 1: Commerce, marketplaces, and consumer services

# WebMCP Challenge — Ideation Batch 1 (30 Ideas)

**Design thesis:** The winning pattern isn't a chatbot bolted onto a site — it's the site itself becoming a programmable stage where the agent manipulates structured state (`document.modelContext` tools) while the human directs through what only they can judge visually: maps, seat charts, photos, floor plans, calendars. Because tools are registered by the app itself, agent actions are intent-level verbs over live session state — not fragile DOM scraping or a parallel REST API — so every autonomous step can land visibly in the UI for human approval before anything money- or commitment-bearing happens.

---

1. **SeatSense** — *Frequent flyers / picking a good plane seat is tribal knowledge.* Human browses the airline's interactive seat map; agent scores seats via tools (legroom, sun side, galley/lav proximity, historical recline complaints), overlays heat colors, human picks, agent sets the seat preference.
Tools: `get_aircraft_config`, `score_seat`, `highlight_seats`, `set_seat_selection`. **Why WebMCP:** seat maps are canvas/SVG state tied to a logged-in booking; no public API exposes per-seat scoring fused to the live map. **Demo beat:** agent paints the map red/green in 5 seconds around a human's cursor hover. **Risk:** sourcing reliable seat-quality data (crowdsourced seed dataset needed).

2. **BasketScout** — *Shoppers / grocery carts silently overpay.* Human visually builds meals from recipe cards; agent prices the full basket via store tools, proposes swaps ("store brand saves $4.10"), human approves/rejects each swap inline; cart updates live.
Tools: `price_basket`, `suggest_substitutes`, `apply_swap`, `clip_coupons`, `get_unit_prices`. **Why WebMCP:** substitution quality depends on live inventory, loyalty pricing, and the actual cart object in-session. **Demo beat:** total drops $23 as human taps through swap suggestions like a game. **Risk:** multi-store coverage — scope to one mock/partner grocer.

3. **PlanPilot** — *Employees during open enrollment / plan documents are unreadable.* Human answers 6 preference sliders; agent pulls plan docs via tools, runs year-cost simulations across scenarios, renders side-by-side comparison cards; human drags their expected-care profile onto each card to re-simulate.
Tools: `list_plans`, `fetch_plan_document`, `simulate_annual_cost`, `compare_coverage`. **Why WebMCP:** plan data lives behind HR portals with auth; simulation must run against the real enrolled-in-flight selection. **Demo beat:** "MRI-heavy year" slider flip instantly reorders all four plans with dollar deltas. **Risk:** actuarial accuracy of the simulation model — label as estimate.

4. **SlotSniper** — *Anyone booking DMV/passport/visa appointments / cancellations vanish in seconds.* Human watches a live calendar; agent polls availability via tools, when a slot appears it highlights it and holds it, human confirms within the hold window — never auto-books.
Tools: `watch_availability`, `hold_slot`, `confirm_booking`, `cancel_hold`. **Why WebMCP:** holds are ephemeral server-side state in the logged-in session; an API wrapper can't flash the slot into the human's visual calendar for a 60-second decision. **Demo beat:** simulated cancellation pops at minute 2, hold countdown, human clicks confirm just in time. **Risk:** real gov sites lack APIs — demo against a faithful mock booking service.

5. **AwardAlchemy** — *Points collectors / cash-vs-points is mental math hell.* Human scrubs a date-range calendar; agent computes cash-vs-points value-per-point for each night via airline/hotel tools and shades the calendar; human taps nights to lock, agent applies the redemption.
Tools: `get_award_pricing`, `get_cash_price`, `compute_points_value`, `book_with_points`. **Why WebMCP:** award space is session-scoped, dynamic, and invisible to static APIs; the shading needs the same calendar the human sees. **Demo beat:** a "sweet spot" week lights up gold — 9.2¢/point vs 1.1 elsewhere. **Risk:** loyalty program data access; use realistic fixtures.

6. **RentRanger** — *Apartment hunters / listings lie, scams abound.* Human swipes listing photos (visual judgment); agent cross-examines each shortlisted unit via marketplace tools — price-vs-comps, duplicate photos across accounts, fee disclosure — and annotates trust badges; human taps "tour," agent books the slot.
Tools: `analyze_listing`, `get_area_comps`, `detect_duplicate_media`, `schedule_tour`, `message_landlord`. **Why WebMCP:** scam signals need cross-listing queries plus the human's gut call on photos in the same tab. **Demo beat:** agent flips a scam badge on a too-good listing mid-swipe, shows the duplicated photo pair. **Risk:** comp-data freshness in the demo environment.

7. **VinVerify** — *Used-car buyers / photos hide rust, listings hide history.* Human eyeballs photo galleries and flags concerns ("that panel looks repainted"); agent responds by pulling vehicle-history, title, open-recall, and price-comp tools scoped to that VIN and annotates the exact photo; human decides offer, agent submits pre-approval.
Tools: `decode_vin`, `get_vehicle_history`, `check_recalls`, `get_market_comps`, `submit_offer_request`. **Why WebMCP:** the loop is literally photo-hover → structured lookup → annotation-on-image inside the marketplace page. **Demo beat:** hover on a fender triggers instant "repaint + prior claim, price should be $1,800 lower." **Risk:** VIN-history data licensing; fixture data acceptable for demo.

8. **SubSurgery** — *Households / forgotten subscriptions bleed money.* Agent enumerates recurring charges from the bank portal via tools and lays them on a surgical tray UI; human examines each visually (logo, last-use evidence), rules keep/cancel/negotiate; agent executes cancellations one confirmed click at a time.
Tools: `list_recurring_charges`, `get_usage_evidence`, `initiate_cancellation`, `capture_retention_offer`, `confirm_cancellation`. **Why WebMCP:** cancellations require authenticated per-merchant sessions; the human must see usage proof before acting. **Demo beat:** tray shrinks $187→$54/mo as six scalpels get clicked. **Risk:** bank aggregation access — use a synthetic statement feed.

9. **RefundRunner** — *Consumers / returns & broken-delivery claims are form purgatory.* Human selects the offending order visually; agent assembles the case — order tool, delivery-photo tool, policy-citation tool — drafts the claim, human edits the narrative inline, agent files and tracks it.
Tools: `get_order_details`, `attach_delivery_photo`, `cite_return_policy`, `file_claim`, `track_claim_status`. **Why WebMCP:** evidence lives scattered across merchant pages in the user's session; filing is a multi-page flow the agent can do once the human approves wording. **Demo beat:** claim assembled and filed in ~40 seconds vs "the 25-minute phone tree." **Risk:** merchant policy variance — constrain to one storefront.

10. **PriceGate** — *Deal watchers / price errors and drops expire before you check.* Agent monitors watchlisted products via tools; on a drop it doesn't buy — it pushes a visual diff card (old/new price, 72h trend) and arms a 5-minute human gate; human taps "buy now" and the agent completes checkout exactly as approved.
Tools: `watch_price`, `get_price_history`, `stage_cart`, `request_purchase_approval`, `execute_approved_checkout`. **Why WebMCP:** staged-cart + approval handshake is precisely the safe-purchase pattern only possible with site-owned verbs. **Demo beat:** alert banner slides in mid-demo; human approves; order confirmation lands before timer ends. **Risk:** proving the gate can't be bypassed under time pressure.

11. **SplitTable** — *Friend groups / group orders end in Venmo chaos.* Everyone adds dishes from the menu UI (visual); agent optimizes: meets free-delivery threshold, splits promos fairly, computes per-head totals including tax/tip via restaurant tools; each person approves their slice.
Tools: `add_to_group_order`, `optimize_promo_threshold`, `split_bill`, `send_payment_requests`. **Why WebMCP:** promo-threshold math must mutate the live shared cart everyone is watching. **Demo beat:** "$4 short of free delivery" → agent nudges two people's add-ons → everyone's total drops. **Risk:** real-time multi-client sync complexity in 10 days.

12. **PantryBridge** — *Home cooks / pantry half-full, recipes half-shoppable.* Human photographs shelf (vision); agent identifies items, matches them against grocery-store catalog tools, renders "cook now" recipes ranked by missing-item count; human picks one, gap items drop straight into the store cart.
Tools: `match_inventory_to_catalog`, `rank_recipes_by_gap`, `add_missing_items`, `check_expiry_windows`. **Why WebMCP:** vision output must resolve against the store's real SKU graph and live cart in one session. **Demo beat:** photo → three recipe cards → tap → 4-item cart appears priced. **Risk:** vision misidentification; show confidence scores.

13. **ClosetGap** — *Style-conscious shoppers / wardrobes full, outfits scarce.* Human photographs closet items and curates a capsule board visually; agent tags attributes via retail catalog tools, proposes the 3 highest-leverage purchases that unlock the most new outfits; human approves, agent fills the cart with fit-checked items.
Tools: `tag_garment_attributes`, `generate_outfit_combos`, `find_catalog_matches`, `add_to_cart_with_fit_check`. **Why WebMCP:** combinatorics need the retailer's attribute-complete catalog; human taste stays the arbiter of every board edit. **Demo beat:** counter ticks "+17 outfits" when one jacket is added. **Risk:** garment attribute extraction accuracy.

14. **RoomFit** — *Furniture buyers / will it fit, will it look right?* Human uploads a room photo and places an anchor marker; agent filters marketplace tools by dimensions against measured walls, projects true-scale silhouettes onto the photo, flags delivery-window conflicts; human swaps candidates until it looks right, agent reserves stock.
Tools: `search_by_dimensions`, `project_scale_overlay`, `check_delivery_window`, `reserve_stock`. **Why WebMCP:** scale projection needs product dims from the marketplace fused with the human's own photo judgment. **Demo beat:** sofa silhouette drags across the photo; agent warns "blocks radiator, 4cm over doorway." **Risk:** monocular scale estimation — provide a reference-object calibration step.

15. **MoveOS** — *Movers / moving = 40 disconnected errands.* Human walks rooms tagging items (keep/sell/donate) on camera; agent sizes the truck via inventory tools, collects mover quotes, books elevator/loading-dock slots, and sequences utility switch-offs; human approves each booking card in a timeline view.
Tools: `estimate_volume`, `collect_mover_quotes`, `book_building_elevator`, `schedule_utility_transfer`. **Why WebMCP:** quotes and dock slots live in separate logged-in services; the human must see the whole timeline to arbitrate conflicts. **Demo beat:** drag a couch between dates → elevator conflict flagged → alternative auto-proposed. **Risk:** breadth — cut to quotes + elevator booking for demo.

16. **BidBoard** — *Homeowners / contractor quotes arrive incomparable.* Human uploads each PDF quote; agent normalizes line items via parsing tools onto one board, flags out-of-scope gaps and outlier pricing; human strikes/merges line items visually; agent generates clarifying questions per contractor.
Tools: `parse_quote_document`, `normalize_line_items`, `flag_scope_gaps`, `benchmark_line_price`, `draft_clarification`. **Why WebMCP:** messy PDFs + human markup on the normalized board is the core alternation; pure API parsing loses the strike-through loop. **Demo beat:** three wildly different quotes snap into one column layout; a $9k outlier glows red. **Risk:** OCR variance on quote formats.

17. **TicketValue** — *Concert goers / resale seat prices are vibes.* Human hovers the venue seat map; agent streams comps via ticket-marketplace tools and paints fair-value coloring per section; human circles target sections, agent alerts when listed price dips under fair value and stages the purchase for approval.
Tools: `get_seat_comps`, `paint_fair_value`, `set_section_alerts`, `stage_ticket_purchase`. **Why WebMCP:** live comp feeds fused to the venue's interactive map in-session; alerts fire into the same visual the human watches. **Demo beat:** a section flips from orange to green mid-demo; human pounces. **Risk:** comp data realism; mock marketplace keeps this honest.

18. **StayPricer** — *Short-term-rental hosts / nightly pricing guesswork.* Host drags price bars on their calendar grid; agent counters with comp-based suggested rates via market tools, showing occupancy elasticity curves per date; host accepts per-day or sweeps a range, agent commits the pricing calendar.
Tools: `get_market_comps`, `suggest_nightly_rate`, `simulate_occupancy`, `commit_rate_calendar`. **Why WebMCP:** rate changes must write to the host platform's live calendar the host is visually editing. **Demo beat:** host drags one weekend up; agent shows projected revenue delta and suggests a smarter adjacent-night bump. **Risk:** believable market data generation.

19. **ChargeRoute** — *EV road-trippers / charging stops wreck spontaneity.* Human drags route waypoints on a map; agent queries charger-network tools for live stall availability, pairs each stop with food options within walk radius, rebalances stops; human reroutes by hand when a stop looks unappealing, agent recomputes in place.
Tools: `get_charger_availability`, `plan_charge_stops`, `find_food_near_charger`, `recompute_route_leg`. **Why WebMCP:** live charger status + the human's aesthetic veto of ugly highway stops; neither alone suffices. **Demo beat:** human drags a waypoint off the interstate; chargers and diners cascade into new positions. **Risk:** live charger API flakiness — cache with timestamps shown.

20. **ConsensusTrip** — *Group trips / 6 people, 6 opinions, zero bookings.* Friends vote on hotel cards visually (swipe); agent watches vote tallies via trip tools, when consensus emerges it places refundable holds on the winner plus runner-up, posts a comparison; humans approve final booking together.
Tools: `tally_votes`, `place_refundable_hold`, `post_consensus_summary`, `confirm_group_booking`. **Why WebMCP:** holds are perishable booking-engine state; the vote UI and the hold countdown must share one screen. **Demo beat:** votes hit threshold live; hold countdown appears; group chat-style approvals land. **Risk:** multi-user sync scope — fake second users with scripted latency.

21. **TariffTamer** — *Households / nobody audits electricity plans.* Human connects their meter dashboard; agent ingests usage via utility tools, simulates annual cost across every available tariff, renders a break-even chart; human reviews risk tolerance (fixed vs TOU) visually, agent initiates the switch paperwork.
Tools: `fetch_usage_intervals`, `list_available_tariffs`, `simulate_annual_bill`, `initiate_plan_switch`. **Why WebMCP:** interval data sits behind the utility login; the switch flow is a multi-step regulated form. **Demo beat:** EV-charging hours highlighted → TOU plan wins by $412/yr → one-click switch filed. **Risk:** utility portal diversity; pick one utility mock.

22. **RxCompare** — *Patients on maintenance meds / pharmacy prices vary 10x.* Human enters medication visually via pill-photo autocomplete; agent queries pharmacy-price and coupon tools, stacks discounts, maps price-vs-distance; human picks pharmacy, agent transfers the prescription request.
Tools: `lookup_drug_pricing`, `stack_discount_coupons`, `map_pharmacy_options`, `request_prescription_transfer`. **Why WebMCP:** coupon stacking requires the pharmacy site's checkout-time state; transfer requests are account-bound actions. **Demo beat:** $180 → $38 after coupon stack; map re-sorts by total cost including drive time. **Risk:** healthcare adjacency — keep strictly to price shopping, no medical advice.

23. **FlipKit** — *Parents / kids gear depreciates fast and clutter piles.* Human sorts outgrown items by photo triage; agent prices each via resale-comp tools, groups into bundles with demand-weighted pricing, drafts listings; human edits photos/prices, agent publishes all in one pass.
Tools: `identify_item_model`, `fetch_resale_comps`, `propose_bundles`, `publish_listings`. **Why WebMCP:** comp lookups keyed off the human's visual condition grading; publishing mutates seller-account state. **Demo beat:** 12 photographed items become 3 bundles with $214 projected return in one sweep. **Risk:** condition-grading subjectivity — human always sets final grade.

24. **EstateSort** — *Adult children downsizing parents' homes / overwhelming triage.* Family walks the house filming; agent segments objects, estimates resale/donation value via estate-market tools, renders a keep/sell/donate board; siblings drag items between columns (the emotional part stays human), agent books charity pickups and lists sale lots.
Tools: `segment_objects_from_video`, `estimate_estate_value`, `book_donation_pickup`, `create_sale_lot`. **Why WebMCP:** video vision + sibling negotiation UI + booked pickups across services in one session. **Demo beat:** one hallway pan produces a sorted board worth $1,300; pickup confirmed on-screen. **Risk:** emotional UX sensitivity + vision segmentation noise.

25. **MenuMate** — *Diners with allergies / menus bury ingredients.* Human sets allergen profile once; as they browse restaurant menus, agent queries ingredient tools per dish and visually defuses unsafe items, ranks safer swaps, drafts a "tell your server" card; human confirms modifications, agent adds them to the online order.
Tools: `get_ingredient_data`, `flag_allergen_risk`, `suggest_safe_swaps`, `annotate_order_note`. **Why WebMCP:** per-dish ingredient data must bind to the live ordering cart; the human's final read of the annotated menu is the safety gate. **Demo beat:** menu grays out 6 dishes instantly; one tap turns pad thai safe (swap sauce). **Risk:** liability framing — present as informational, verify-with-staff messaging.

26. **GiftPool** — *Friend groups / group gifts = chasing payments.* Organizer shortlists gifts visually from a storefront; agent computes per-person shares via payment tools, sends contribution links, shows a filling progress bar over the gift photo; when funded, agent checks out with the group card on file — after explicit organizer approval.
Tools: `shortlist_gift_options`, `create_contribution_pool`, `track_contributions`, `checkout_funded_gift`. **Why WebMCP:** pool state must live beside the real storefront cart; funding completion gates a real checkout the human authorizes. **Demo beat:** progress bar hits 100% as three scripted friends pay; one approval click fires checkout. **Risk:** payment handling — use test mode exclusively.

27. **RegistryMerge** — *Wedding/new-parent couples / registries scatter across stores.* Couple drags desired items from any partner store into one universal registry; agent deduplicates via catalog tools, tracks purchased-status across stores, and nudges price-drop replacements; guests see one beautiful list, agent routes each gift to the right store cart with guest approval.
Tools: `import_registry_item`, `deduplicate_items`, `sync_purchased_status`, `route_guest_to_cart`. **Why WebMCP:** purchased-status sync requires reading multiple stores' registry states in-session. **Demo beat:** three store tabs collapse into one list; a purchased item flips to "claimed" everywhere simultaneously. **Risk:** cross-origin tool exposure limits (`exposedTo`) — architect carefully or simulate.

28. **CardSharp** — *Rewards optimizers / wrong card at checkout costs 3%.* At any checkout page, agent reads the merchant/category via commerce tools and ranks the wallet's cards by effective return, showing why (category bonus, cap status); human taps a suggestion, agent notes it for the statement-tracking ledger.
Tools: `detect_merchant_category`, `rank_wallet_cards`, `explain_reward_math`, `log_optimal_card_use`. **Why WebMCP:** detection must happen inside the merchant's checkout context at the moment of truth. **Demo beat:** three checkouts back-to-back; correct card highlighted each time; annualized savings ticker climbs. **Risk:** wallet-card terms ingestion; ship with a preset wallet.

29. **ManualMate** — *Homeowners / appliance manuals and warranties vanish.* Human photographs the appliance fleet; agent matches models via manufacturer catalog tools, registers warranties, and builds a seasonal maintenance schedule with filter/part SKUs; human approves the season's tasks, agent orders the parts bundle.
Tools: `identify_appliance_model`, `register_warranty`, `build_maintenance_schedule`, `order_parts_bundle`, `check_warranty_claim_eligibility`. **Why WebMCP:** warranty registration and parts ordering execute inside manufacturer/storefront flows bound to the owner's accounts. **Demo beat:** five garage photos → five registered warranties + one $47 parts cart covering all fall tasks. **Risk:** manufacturer catalog coverage; seed with major brands.

30. **VisaStack** — *Multi-country travelers / transit visa rules are a minefield.* Human lays out itinerary legs on a map timeline; agent evaluates each leg against passport rules via travel-rule tools, stamps requirements (e-visa/transit/no-entry) onto each leg, opens the correct application flows; human fills gaps only where automation can't, agent tracks application statuses.
Tools: `evaluate_visa_requirement`, `open_application_flow`, `track_application_status`, `flag_transit_risk`. **Why WebMCP:** rule evaluation binds to the actual booked flights in the user's airline sessions; applications are per-government-portal flows. **Demo beat:** Istanbul layover stamped amber "transit visa required" mid-demo; e-visa flow opens prefilled. **Risk:** rule-data correctness and staleness — cite sources per stamp.

---

## TOP 5

1. **SeatSense (#1)** — the seat map is the perfect human-visual/agent-structured split; instantly legible in a 90-second video and impossible without browser-native tools.
2. **SlotSniper (#4)** — universally felt pain, razor-thin scope, and the hold-countdown-confirm loop is the most dramatic human-gate pattern possible.
3. **PlanPilot (#3)** — biggest dollar impact per user; sliders-to-simulation makes the agent's structured reasoning visible and interactive rather than chatty.
4. **BasketScout (#2)** — relatable savings with rapid approve/reject swap loops; easy to build convincingly on one mock grocer with real-feeling data.
5. **AwardAlchemy (#5)** — points nerds are vocal judges; calendar shading by cents-per-point is a wow moment that proves deep WebMCP leverage over logged-in travel state.

---

## Batch 2: Knowledge work, education, and creativity

**Design thesis:** WebMCP's superpower isn't automation — it's *co-presence*: the agent's structured actions and the human's judgment render in the same visible document, so every tool call is a move on a shared board. The winning apps will be ones where the page itself declares a vocabulary of reversible, schema'd moves (`accept`, `reject`, `annotate`, `lock`, `re-render`) and the human's taste is the constraint the agent optimizes against — something no headless backend API can replicate, because the value lives in the visible alternation, not the result.

---

1. **ClaimLoom** — *Newsroom fact-checkers drowning in unverified claims in drafts.* Editor highlights any sentence → agent fans out evidence cards from live web sources beside it; editor drags each to "verified / contested / retracted," which retrains what sources agent surfaces next. Tools: `extract_claim`, `fetch_evidence`, `attach_source_card`, `mark_verdict`, `insert_footnote`. *Why WebMCP:* verdicts mutate the live draft DOM; evidence renders inline where the editor's eyes already are. *Demo:* highlight "crime fell 40%" → three source cards appear → one click pins a footnote. *Risk:* source-quality ranking accuracy.

2. **Sieve** — *Researchers screening 2,000 abstracts for systematic reviews.* Agent pre-sorts with reasons; human adjudicates borderline cases in a swipeable queue; each adjudication visibly updates the agent's inclusion criteria shown as editable rules. Tools: `queue_next_abstract`, `record_include_exclude`, `update_criteria_rule`, `export_prisma_counts`. *Why WebMCP:* criteria rules are first-class UI objects both parties read/write; PRISMA flow diagram animates live. *Demo:* screen 30 abstracts in 90 seconds, flow diagram fills in real time. *Risk:* criteria drift without the human noticing.

3. **Rubric Room** — *Professors grading 200 essays inconsistently.* Professor grades 5 samples by hand → agent fits the rubric, pre-scores the rest with confidence flags → professor spot-checks only flagged outliers, and each override re-fits live. Tools: `score_submission`, `flag_low_confidence`, `apply_override`, `summarize_grade_distribution`. *Why WebMCP:* overrides happen on the same annotated submission view the agent scored; distribution histogram shifts instantly. *Demo:* grade 5 essays, agent scores 195, professor fixes 3 outliers in 60s. *Risk:* fairness/bias perception of AI pre-scoring.

4. **CanonLock** — *Interactive-fiction authors whose serials contradict themselves.* Author locks facts ("Mara is left-handed") into a canon panel; agent continues scenes constrained by canon, proposing new facts that glow until approved or vetoed. Tools: `get_canon_facts`, `propose_fact`, `lock_fact`, `continue_scene`, `check_contradiction`. *Why WebMCP:* canon panel is a shared mutable surface; contradictions highlight inline in the manuscript. *Demo:* write one scene, approve two glowing facts, watch agent draft the next chapter with zero contradictions. *Risk:* long-context consistency across many chapters.

5. **PanelForge** — *Comic creators losing character consistency across pages.* Writer roughs panel layout on a canvas → agent renders panels honoring a character bible → creator redraws details, which the bible ingests as new constraints. Tools: `render_panel`, `get_character_sheet`, `update_character_sheet`, `check_continuity`, `reorder_pages`. *Why WebMCP:* canvas state and character bible are page-owned; agent edits appear as diff-ghosts over the art. *Demo:* sketch 6 empty panels, agent fills them with a consistent hero, one hair-color fix propagates everywhere. *Risk:* image-gen latency and cost.

6. **ChapterMark** — *Podcast editors spending hours on chapters and show notes.* Editor scrubs audio, taps "moment" at highlights → agent proposes chapter boundaries, titles, and pull-quotes aligned to those moments → editor nudges boundaries on the waveform. Tools: `add_moment_marker`, `propose_chapters`, `set_chapter_title`, `generate_show_notes`, `export_youtube_timestamps`. *Why WebMCP:* markers, waveform, and text are one synchronized DOM state agents manipulate directly. *Demo:* tap 4 moments during playback, chapters+notes assemble in seconds. *Risk:* speech-to-text alignment precision.

7. **FigureDoctor** — *Reviewers rejecting papers over broken charts.* Reviewer circles an axis/colorbar issue → agent pulls the underlying CSV from the paper's repo, re-renders colorblind-safe, relabels, and overlays before/after for approval. Tools: `inspect_figure`, `fetch_underlying_data`, `rerender_figure`, `annotate_review_comment`, `swap_figure_version`. *Why WebMCP:* the figure is a live component in the page, not a static image — only browser context makes surgical replacement possible. *Demo:* circle one bad legend, agent swaps in a fixed SVG in front of you. *Risk:* parsing heterogeneous plotting code.

8. **CodeCheck** — *Architecture reviewers checking drawings against building codes.* Reviewer drops a pin on a floor plan → agent measures against adopted code editions, cites clause numbers, annotates the plan → reviewer accepts citations into the stamped report. Tools: `measure_region`, `lookup_code_clause`, `annotate_plan_pin`, `compile_compliance_report`. *Why WebMCP:* measurements and annotations must land on the exact drawing viewport the reviewer sees; clause links open in adjacent tabs the agent reads. *Demo:* pin a stairwell, agent flags 2" insufficient egress width with citation. *Risk:* code-database correctness liability.

9. **TriageWall** — *OSS maintainers buried under issue backlogs.* Maintainer drags issues into columns → agent reproduces bugs in sandboxed iframes, drafts labels + minimal repro comments → maintainer edits diffs inline before sending. Tools: `list_issues`, `attempt_repro`, `apply_label`, `draft_repro_comment`, `suggest_patch_diff`. *Why WebMCP:* repro happens in the actual app's iframe via its own tools; maintainer sees every agent action as wall motion. *Demo:* triage 20 issues in 2 minutes, 3 auto-repros succeed live. *Risk:* sandboxed repro environment setup.

10. **ProgramForge** — *Conference chairs hand-scheduling 80 talks around conflicts.* Chairs mark hard constraints by clicking speaker pairs ("never parallel") → agent solves the grid → chairs drag-swaps, and the solver re-verifies instantly with green/red ripples. Tools: `add_constraint_pair`, `solve_schedule`, `validate_grid`, `swap_sessions`, `publish_program`. *Why WebMCP:* the schedule grid is the shared artifact; constraint clicks and solver output coexist visually. *Demo:* add 3 conflicts, hit solve, watch the grid settle in seconds. *Risk:* solver UX for unsatisfiable constraints.

11. **KinshipLoom** — *Families whose genealogy files contradict each other.* Relatives upload photos/stories → agent cross-links census records and flags contradictions ("two birth years") → a designated elder resolves, resolution propagates to everyone's tree view. Tools: `link_census_record`, `flag_conflict`, `resolve_conflict`, `merge_person_records`, `attach_oral_story`. *Why WebMCP:* contradiction cards render on the shared family-tree canvas; record lookups use the browser's authenticated sessions on archive sites. *Demo:* upload grandma's letter, agent finds the conflicting 1920 census row, elder resolves. *Risk:* OCR quality on old records.

12. **SpeciesSift** — *Citizen-science platforms flooded with misidentified photos.* Volunteers confirm/reject ID cards in a rapid queue → agent learns from each swipe, reorders the queue hardest-first, and pushes high-confidence confirmations straight into the biodiversity database. Tools: `next_id_candidate`, `record_verdict`, `update_model_threshold`, `commit_observation_record`. *Why WebMCP:* verdict swipes and model-threshold dials sit on one screen; commits hit the project DB through page-declared tools. *Demo:* clear a 50-photo queue while the confidence dial visibly tightens. *Risk:* expert-volunteer ground truth noise.

13. **Counterpoint Coach** — *Music students writing species counterpoint alone.* Student places notes on a staff → agent checks voice-leading rules via tools, painting violations red with rule citations → student fixes, violations fade; coach mode explains the worst one aloud. Tools: `check_voice_leading`, `highlight_violation`, `explain_rule`, `generate_counterline`. *Why WebMCP:* rule-checking mutates the live notation canvas; agent can't just hand back MIDI — the staff IS the interface. *Demo:* write a parallel-fifths line, watch it bleed red, fix it to green. *Risk:* notation library complexity.

14. **BranchTales** — *Language learners who plateau reading graded readers too easy.* Learner picks plot branches at choice points → agent keeps prose at i+1 vocab level, and unfamiliar words flow into a spaced-repetition deck that gates future branches. Tools: `continue_branch`, `set_vocab_level`, `enqueue_srs_card`, `gloss_word`. *Why WebMCP:* difficulty dial and SRS deck are visible sliders both sides adjust mid-story; branch rendering is client-side. *Demo:* choose "enter the cave," get a story paragraph with 3 tappable new words, deck grows. *Risk:* keeping generated prose genuinely level-calibrated.

15. **SparRoom** — *Debaters preparing with no sparring partner available.* Debater states a case → agent attacks with the strongest sourced opposition via live research tools → debater tags each attack with their response type, building a visible coverage matrix of weaknesses. Tools: `pull_opposing_evidence`, `raise_objection`, `tag_response`, `compute_coverage_matrix`. *Why WebMCP:* objections appear as cards on the debate flow the human is actively editing; evidence fetches ride the user's authenticated browsing. *Demo:* agent lands 5 objections in 90s, matrix shows two uncovered flanks. *Risk:* evidence-source reliability.

16. **GlossaryGuard** — *Translation teams inconsistent across 400-page docs.* Translator corrects one term's register → agent sweeps the whole doc applying glossary + tone profile, showing a diff ribbon of every change → translator approves in batches. Tools: `define_glossary_term`, `apply_glossary_sweep`, `show_diff_ribbon`, `flag_register_inconsistency`. *Why WebMCP:* the diff overlay lives on the bilingual side-by-side pane the translator reads; approvals are per-hunk UI gestures. *Demo:* fix one term, 47 instances harmonize with an animated ribbon. *Risk:* context-dependent term exceptions.

17. **RedlineRoom** — *Small-business lawyers negotiating contracts slowly.* Lawyer edits a clause → agent maps it against a risk playbook, proposes precedent alternates as stacked cards → lawyer accepts one, playbook risk meter visibly drops. Tools: `parse_clause`, `match_playbook_risk`, `propose_alternate_clause`, `accept_redline`, `compute_risk_score`. *Why WebMCP:* risk meter and clause cards share the contract document's state; nothing leaves the tab (privilege). *Demo:* rewrite an indemnity clause, risk score falls 70→22 with cited precedent. *Risk:* jurisdiction-specific legal accuracy.

18. **Retrofit Studio** — *Agencies retrofitting old sites for accessibility.* Auditor toggles an axe-detected violation → agent applies the fix (ARIA, contrast, focus order) to a live preview iframe → auditor keyboard-walks it to verify, then batch-applies site-wide patterns. Tools: `run_axe_audit`, `apply_fix_pattern`, `preview_fix`, `verify_keyboard_nav`, `batch_apply_pattern`. *Why WebMCP:* fixes execute inside the real preview iframe via exposedTo tools; verification is literally the human using the page. *Demo:* fix a modal's focus trap, Tab through it live, apply pattern to 12 modals. *Risk:* fix patterns generalizing badly.

19. **DataDesk** — *Data journalists who can't code racing deadlines.* Reporter types a question about the leaked dataset → agent runs structured queries, builds inline charts → reporter circles an outlier, asks "why," agent drills down and drafts the chart caption. Tools: `query_dataset`, `build_chart`, `drill_down_filter`, `draft_caption`, `pin_to_storyboard`. *Why WebMCP:* queries, charts, and captions compose on one story canvas; the agent manipulates the same chart objects the reporter styles. *Demo:* "which district got the most overtime?" → chart → circle anomaly → drill-down reveals the story lede. *Risk:* query hallucination on dirty data.

20. **BudgetPlain** — *Newsrooms explaining municipal budgets to residents.* Journalist clicks a budget line item → agent drafts plain-language summary + historical trend + who's affected → journalist edits tone, reader comments flag confusion, agent proposes clarifications. Tools: `fetch_line_item_history`, `draft_plain_summary`, `insert_trend_chart`, `collect_reader_flags`, `revise_for_flag`. *Why WebMCP:* line-item clicks, summaries, and reader flags all bind to the published article's DOM. *Demo:* click "capital equipment," get a 3-sentence explainer with a 10-year sparkline. *Risk:* budget PDF extraction quality.

21. **RecipeLab** — *Recipe developers iterating on versions with lost context.* Chef tastes and tweaks ("less acid") → agent scales, converts units, recomputes nutrition, and forks a versioned tree node → chef compares two branches side-by-side with ingredient deltas highlighted. Tools: `fork_recipe_version`, `scale_servings`, `convert_units`, `compute_nutrition`, `diff_versions`. *Why WebMCP:* the version tree is interactive canvas state; tasting notes attach to nodes the agent traverses. *Demo:* fork v3 twice with different tweaks, diff view shows exactly why v5 won. *Risk:* nutrition estimation accuracy.

22. **LookbookLoop** — *Independent stylists building looks from scattered inventory.* Stylist pins garments → agent checks color harmony, size availability across retailer tabs, and orders a flat-lay → stylist swaps one piece, ripple effects show what breaks. Tools: `pin_garment`, `check_color_harmony`, `check_size_availability`, `compose_flatlay`, `flag_clash`. *Why WebMCP:* availability checks need the user's logged-in retailer sessions across origins; the moodboard is the shared surface. *Demo:* swap red boots for green, one clash flag pops, agent suggests two substitutes. *Risk:* retailer tab automation fragility.

23. **ExhibitAssembly** — *Small museums curating without exhibit designers.* Curator picks artifacts from the collection DB → agent writes 60-word wall labels in the institution's voice, checks image rights, and arranges a floor-plan flow → curator drags artifacts, label tone adapts. Tools: `search_collection`, `draft_wall_label`, `verify_image_rights`, `arrange_floorplan`, `adjust_label_tone`. *Why WebMCP:* rights checks run through authenticated licensing portals in other tabs; the floor plan and labels co-update live. *Demo:* pick 6 artifacts, get a walkable exhibit with rights-cleared labels in 2 minutes. *Risk:* rights verification coverage.

24. **StoryKeep** — *Oral-history projects with hours of unindexed tape.* Interviewer marks emotional beats during playback → agent segments, timestamps, and theme-tags the transcript → historian approves tags, and the public archive page builds itself with jump-to-moment links. Tools: `segment_transcript`, `tag_theme`, `approve_tag`, `build_archive_page`, `link_moment_clip`. *Why WebMCP:* beat marks, transcript, and archive preview are one synchronized view; approval gestures shape tag taxonomy live. *Demo:* mark 3 beats, publish a searchable archive entry with clip links. *Risk:* long-audio transcription cost.

25. **VoiceKeeper** — *Marketing teams whose copy drifts off brand voice.* Marketer approves/rejects sample rewrites to calibrate → agent audits every asset in the CMS, rewriting off-voice strings with diffs → each accept sharpens the voice profile shown as radar chart. Tools: `audit_voice_consistency`, `rewrite_in_voice`, `accept_rewrite`, `update_voice_profile`. *Why WebMCP:* rewrites appear as tracked-changes inside the actual CMS editor; calibration is visible gesture data. *Demo:* calibrate on 5 examples, sweep the site, 14 off-voice headlines fix themselves. *Risk:* voice profiles going homogenizing.

26. **CoverageRoom** — *Script editors tracking arcs across revision passes.* Reader drops margin notes on beats → agent maps them onto a character-arc timeline, spotting where a subplot vanishes for 20 pages → writer accepts "bridge scene" suggestions into the outline. Tools: `add_margin_note`, `build_arc_timeline`, `detect_arc_gap`, `suggest_bridge_beat`, `compare_revisions`. *Why WebMCP:* notes, timeline, and script revisions share one document state; gap highlights appear in both views simultaneously. *Demo:* note "protagonist passive here," timeline exposes her 18-page absence, bridge beat inserted. *Risk:* beat detection on nonlinear scripts.

27. **ReplicationRadar** — *Scientists attempting replications from vague methods sections.* Replicator logs deviations while running the study → agent diffs the methods text against the shared code notebook, flagging mismatches → original authors get a structured query list instead of email chaos. Tools: `parse_methods_text`, `diff_code_notebook`, `log_deviation`, `generate_author_queries`. *Why WebMCP:* the diff renders between the paper PDF pane and notebook pane in one tab; deviations are clickable anchors in both. *Demo:* log one deviation, agent finds the code uses n=100 vs paper's stated n=250. *Risk:* heterogeneous code/paper formats.

28. **CurriculumWeaver** — *Teachers aligning lessons to standards manually.* Teacher drags lesson blocks onto a standards map → agent checks alignment coverage, generates missing prerequisite mini-lessons → teacher reorders, gaps recalculate as a living heatmap. Tools: `map_standard_alignment`, `find_coverage_gaps`, `generate_prerequisite_lesson`, `reorder_sequence`. *Why WebMCP:* the standards heatmap is shared mutable UI; generated lessons drop into the same sequence canvas teachers edit. *Demo:* drag 8 lessons, heatmap shows standard 4.2 uncovered, agent drafts the filler. *Risk:* standards-database licensing.

29. **WikiWarden** — *Community wikis drowning in uncited claims.* Editors patrol a diff queue → agent proposes citations from its own browsing, marks original-research suspects → editor accepts cite or flags deletion, and the wiki's citation-health score updates. Tools: `queue_uncited_claim`, `propose_citation`, `flag_original_research`, `insert_ref`, `update_health_score`. *Why WebMCP:* proposals anchor to exact wikitext spans in the live editor; citation fetches reuse the editor's authenticated sessions. *Demo:* clear 10 claims, health score climbs 61%→78% on screen. *Risk:* predatory-source filtering.

30. **LoreTable** — *TTRPG game masters improvising while bookkeeping collapses.* GM narrates aloud → agent updates the shared world wiki: NPC states, loot, timeline → players see lore entries shimmer as they change and can petition retcons the GM rules on. Tools: `update_lore_entry`, `track_npc_state`, `append_timeline_event`, `petition_retcon`, `resolve_petition`. *Why WebMCP:* the wiki IS the table's shared screen; agent edits animate where all players are already looking, petitions are player-side UI actions. *Demo:* improvise 90 seconds of play, watch 6 wiki entries update hands-free. *Risk:* speech recognition in noisy rooms.

---

**TOP 5:**

1. **Sieve (#2)** — The criteria-rules-as-shared-artifact loop is pure WebMCP: every human swipe visibly rewrites the agent's policy, and PRISMA compliance gives it instant credibility with real researchers.
2. **Retrofit Studio (#18)** — Human verifies by *using* the page while the agent patches it — the most literal embodiment of human-agent co-presence, with a visceral before/after demo.
3. **LoreTable (#30)** — Turns a whole gaming table into the audience watching agent edits shimmer onto their shared world; emotionally memorable demo, zero domain-expertise needed from judges.
4. **DataDesk (#19)** — Circle-to-drill-down is a genuinely new interaction primitive for journalism, and the "agent finds your lede" beat lands hard in under 3 minutes.
5. **CanonLock (#4)** — Canon facts glowing until approved makes agent constraint-tracking *visible and tactile*, solving a real pain for serialized fiction writers with a demo judges instantly get.

---

## Batch 3: Accessibility, civic life, care, and resilience

# Agent 3 — 30 WebMCP Challenge Ideas

**Design thesis:** WebMCP's superpower is that the agent's hands live *inside* the page's own logic while the human sits in the same UI — so every idea below makes the site itself the collaboration canvas: tools are staged actions (drafts, holds, diffs) that only become real through an explicit human click, and every tool result renders provenance inline. The winning apps will be multi-portal, session-bound workflows (benefits portals, insurer sites, county GIS pages) where a backend API is impossible because the data and the authority to act are locked inside logged-in web apps the human already trusts.

---

1. **FormPilot** — Blind/low-vision users drowning in government forms (SNAP renewals, FAFSA). Loop: agent maps form structure via screen-reader-native summaries → proposes field-by-field answers → user confirms each with Enter before staging → one final review diff. Tools: `form.describeStructure`, `field.suggestValue`, `field.commitWithConsent`, `submission.stageDraft`, `undo.revertField`. Why WebMCP: the form *is* the DOM; a backend can't see or fill it, and confirmation must happen in-page for SR users. Demo beat: complete a 40-field benefits renewal in 90 seconds, narrated entirely by the screen reader. Risk: brittle third-party form structures.
2. **PlainLens** — People with cognitive disabilities facing dense legalese (leases, benefit notices). Loop: agent highlights clauses in place → user taps any highlight → plain-language rewrite appears beside original → user pins "keep simplified" rules the agent reuses. Tools: `page.scanComplexity`, `clause.explain`, `rewrite.applyInline`, `rewrite.undoAll`, `prefs.saveReadingRules`. Why WebMCP: transformations must be reversible *in the live DOM* with visible side-by-side provenance; a proxy or extension rewrite loses trust and context. Demo beat: a real lease transforms clause-by-clause as the user taps, then snaps back untouched with one button. Risk: rewrite accuracy on legal text without drifting into advice.
3. **AltText Guild** — Screen-reader users hitting unlabeled charts/images on any site. Loop: agent drafts alt text from image + surrounding DOM → user (who may be blind) edits via SR-friendly review queue → approved texts stored and auto-suggested site-wide on revisit. Tools: `media.findUnlabeled`, `alt.draftFromContext`, `alt.submitReview`, `guild.publishLocal`, `stats.missingAltReport`. Why WebMCP: runs against arbitrary pages' real images in-session; the review queue must be keyboard/SR-first in-page. Demo beat: a chart-heavy city-budget PDF page goes from 12 missing alts to fully labeled, read aloud live. Risk: describing complex infographics correctly from pixels alone.
4. **SwitchStack** — Motor-impaired switch/dwell users repeating 30-click sequences in web apps. Loop: user demonstrates a sequence once with co-pilot recording each step → agent compresses it into a named macro → each replay shows a step checklist the user can pause/skip mid-run. Tools: `input.startRecording`, `macro.saveSequence`, `macro.replayWithCheckpoints`, `macro.abortNow`, `library.shareMacro`. Why WebMCP: macros must fire the app's own registered tools (not synthetic clicks), keeping them reliable and consent-gated per run. Demo beat: a 27-step photo-upload flow collapses into two switch presses with visible checkpoints. Risk: timing/state sensitivity of recorded sequences across app updates.
5. **CivicVoice** — Residents intimidated by rulemaking comment periods (EPA, FCC dockets). Loop: user speaks bullet points → agent locates the exact docket sections they address → drafts a personal comment citing line numbers → user edits inline → staged until they hit Submit on the portal themselves. Tools: `docket.fetchSections`, `comment.draftFromNotes`, `citation.linkSource`, `comment.stageForReview`, `portal.submitOnce`. Why WebMCP: comments carry legal weight; submission must be a portal-mediated, user-initiated act with a receipt rendered in-page. Demo beat: a 3-bullet voice memo becomes a cited comment filed to Regulations.gov with a docket receipt. Risk: scraping docket structure reliably within demo time.
6. **AgendaLens** — Renters/small owners who never know which council agenda items hit their block. Loop: user enters address → agent scans published agendas, flags items within N feet → user marks affected items → agent prepares public-comment signup and speaker notes. Tools: `agenda.parseCityCalendar`, `geo.matchParcelToItems`, `brief.generateImpactNote`, `signup.reserveSpeakerSlot`, `watch.subscribeAddress`. Why WebMCP: agendas live in dozens of municipal CMSes behind sessions; matching and signup happen in the user's actual city portal tab. Demo beat: "There's a variance hearing about YOUR street Thursday" moment, followed by one-click speaker signup. Risk: municipal site heterogeneity.
7. **SunshineDesk** — Journalists/neighbors who don't know how to file records requests. Loop: user describes what they want → agent picks the right agency template from state FOIA pages → drafts statutory-language request → human tunes scope → agent files via portal and tracks the response clock. Tools: `agency.findRecordsOffice`, `request.draftFromTemplate`, `scope.narrowWithUser`, `portal.fileRequest`, `deadline.startClock`. Why WebMCP: filing happens inside each agency's idiosyncratic portal with the user watching every field. Demo beat: "Who approved this permit?" answered with a filed request + countdown timer in under 2 minutes. Risk: jurisdiction-specific statute phrasing.
8. **BudgetTogether** — Participatory-budgeting volunteers drowning in duplicate project pitches. Loop: neighbors submit ideas in-app → agent clusters similar ones and stress-tests costs against the city's open-checkbook tools → humans merge/edit in a facilitated session view → compliant shortlist exported to the city form. Tools: `ideas.clusterSimilar`, `cost.checkCityRates`, `proposal.mergeVersions`, `eligibility.validateAgainstRules`, `form.exportToCityPortal`. Why WebMCP: the deliberation happens in the shared UI while the agent works the city's real budget tools in another frame/tab (`exposedTo` cross-origin). Demo beat: 43 messy pitches become 7 costed proposals live during a mock neighborhood assembly. Risk: clustering quality on small corpora.
9. **JuryRoom** — Prospective jurors confused by deferral/hardship options. Loop: user enters summons details → agent reads their court portal, lists legitimate options (deferral, reschedule, hardship docs) → user picks → agent stages the request and checklist, never submitting without a typed confirm. Tools: `summons.parseNotice`, `options.listEligiblePaths`, `docs.checklistGenerate`, `portal.stageRequest`, `consent.typeToConfirm`. Why WebMCP: court e-filing portals have no APIs and demand exact session-bound steps; navigation-only framing avoids legal advice. Demo beat: a scary summons becomes a stamped "rescheduled" confirmation on screen. Risk: courts vary wildly; pick 1–2 counties deeply.
10. **EmberPlan** — Families in wildfire zones without a rehearsed evacuation plan. Loop: agent pulls live fire-perimeter and road-closure layers → builds 2 route options + go-bag checklist → family members approve meeting points individually in the shared plan → plan syncs to phones; drills re-run seasonally. Tools: `gis.getFirePerimeter`, `routes.proposeEvacOptions`, `checklist.buildGoBag`, `family.collectApprovals`, `drill.scheduleRehearsal`. Why WebMCP: county GIS viewers are interactive map apps; the agent drives the *real* map layers so the family sees truth, not a summary. Demo beat: a fake red perimeter blooms on the map and the household plan assembles itself around it in 60 seconds. Risk: dependence on live data availability during demo.
11. **DraftProof** — Homeowners leaving rebate money (IRA/weatherization) unclaimed. Loop: user walks the house answering photo prompts → agent matches findings against utility & state rebate catalogs opened in tabs → stacks eligible programs → pre-fills utility account applications for item-by-item approval. Tools: `audit.scoreHomeFromPhotos`, `rebate.matchCatalogs`, `stack.combineIncentives`, `application.prefillUtilityPortal`, `consent.approvePerField`. Why WebMCP: rebate applications live behind authenticated utility accounts with no APIs; stacking math needs data from multiple logged-in tabs. Demo beat: "$4,300 back" total materializes from three stacked rebates as each portal tab fills itself. Risk: program-rule churn.
12. **MutualGrid** — Mutual-aid groups coordinating after floods/storms via chaos of group chats. Loop: needs/offers posted in-app → agent triages by urgency and proximity using map tools → proposes matches → both parties tap to accept → dispatch log keeps provenance of every handoff. Tools: `intake.parseNeedPost`, `map.rankByDistance`, `match.proposePairing`, `dispatch.confirmBothSides`, `log.renderHandoffTrail`. Why WebMCP: volunteers work inside one shared board while the agent manipulates the same board state; every match is a visible, reversible card move. Demo beat: a simulated flood morning: 30 posts triaged into 8 confirmed rides/repairs with names attached. Risk: cold-start data for the demo scenario.
13. **BillGuard** — Low-income households facing utility shutoff notices. Loop: user photographs bill + notice → agent parses amounts/deadlines, opens the utility's assistance page in-tab → finds LIHEAP/payment-plan eligibility → stages the application and hardship-call script. Tools: `bill.extractCharges`, `assistance.findPrograms`, `plan.comparePaymentOptions`, `application.prefillAssistanceForm`, `script.generateCallOutline`. Why WebMCP: assistance applications sit inside the utility's logged-in customer portal; deadline math must render next to the actual notice. Demo beat: a shutoff notice turns into a submitted payment-plan application with the disconnect flag visibly lifted. Risk: OCR accuracy on crumpled paper photos.
14. **HeatWatch Block Captain** — Seniors living alone during heat waves. Loop: opted-in neighbors appear on a wellness roster → agent ranks risk (heat index × isolation × meds-requiring-cooling flags the user self-declared) → captain approves each outreach → agent drafts call/text via preferred channel and logs outcomes. Tools: `roster.getOptedInNeighbors`, `risk.rankHeatVulnerability`, `outreach.stageCallOrText`, `log.recordWellnessCheck`, `escalation.suggestEmergencyPath`. Why WebMCP: roster, consent toggles, and call scripts all live in one civic UI; the agent never contacts anyone without the captain's per-person approval. Demo beat: a 103°F day simulation where five check-ins get dispatched and two get escalated — visibly. Risk: feels surveillance-y unless opt-in UX is impeccable.
15. **AppealAid** — Patients with claim denials who give up. Loop: user uploads denial letter → agent opens their insurer portal, pulls the actual plan language and denial reason codes → drafts an administrative appeal citing those lines → attaches user-approved evidence → stages submission for final human click. Tools: `denial.parseLetter`, `plan.fetchCoveredBenefits`, `appeal.draftWithCitations`, `evidence.attachDocuments`, `claim.stageAppeal`. Why WebMCP: the plan document and appeal upload exist only inside the payer's authenticated portal; citations link letter→policy side-by-side in-page. Demo beat: a $2,340 denial flips to "appeal submitted" with each citation highlighted green against the real policy text. Risk: staying administrative, not medical/legal advice.
16. **BillSift** — Patients overcharged vs. published prices. Loop: user uploads itemized bill → agent cross-references the hospital's machine-readable price-transparency file (opened in-tab) → flags outlier lines → drafts a good-faith billing inquiry per flagged line → user sends selectively. Tools: `bill.parseItemizedLines`, `pricing.matchTransparencyFile`, `flags.rankAnomalies`, `inquiry.draftPerLine`, `send.selectiveDispatch`. Why WebMCP: price files and patient portals are separate web properties requiring the browser to bridge them with visible receipts. Demo beat: a bill lights up line-by-line — $47 vs. $290 charged — and a polite inquiry composes itself. Risk: price-file formats are messy despite the mandate.
17. **TrialMate** — Patients curious about clinical trials but lost in ClinicalTrials.gov. Loop: user states location/condition preferences (never symptoms-to-diagnosis) → agent searches registry listings in-tab, filters logistics-only criteria (distance, visit burden) → builds a comparison sheet → generates a question list to bring to their doctor. Tools: `registry.searchListings`, `filter.byLogisticsOnly`, `sheet.buildComparisonTable`, `questions.prepareDoctorVisit`, `share.exportSummary`. Why WebMCP: eligibility nuance stays with the doctor; the agent's value is taming a hostile registry UI in front of the user. Demo beat: 9,000 results narrow to 3 nearby trials with travel-time badges and a printable doctor sheet. Risk: accidentally implying eligibility judgment.
18. **PortalRunner** — Disabled patients juggling interpreter booking, wheelchair transport, and portal forms per appointment. Loop: after booking, agent sweeps the health system's transport/interpreter sub-portals → reserves accommodations → confirms each reservation card with one tap → attaches them to the appointment. Tools: `appointments.listUpcoming`, `transport.requestWheelchairVan`, `interpreter.bookLanguageService`, `cards.confirmReservations`, `summary.attachToVisit`. Why WebMCP: these services are fragmented micro-apps inside one health system; orchestration must happen across their frames with visible confirmations. Demo beat: one tap turns a bare appointment card into a fully accommodated visit: van at 9:15, ASL interpreter booked. Risk: sandboxing health-system portals for demo.
19. **DischargeDeck** — Families panicking at hospital discharge with a 14-task list on paper. Loop: photograph discharge papers → agent decomposes into tasks (pharmacy pickup, follow-up slots, home equipment) → assigns family members in-app → books what's bookable online with per-task approval. Tools: `discharge.decomposeInstructions`, `tasks.assignFamilyMember`, `pharmacy.reservePickupSlot`, `equipment.findDMEProviders`, `board.trackCompletion`. Why WebMCP: pharmacy/DME scheduling happens in their web portals while the family watches the shared checklist tick over. Demo beat: a crumpled discharge sheet becomes a fully booked Tuesday: meds reserved, nurse visit scheduled, ramp rental confirmed. Risk: scope creep toward medical interpretation — keep it logistics.
20. **CareCircle** — Sandwich-generation siblings coordinating an aging parent's care across siloed portals. Loop: each sibling consents to specific scopes (pharmacy yes, messages no) → agent aggregates appointments/refills/tasks into one weekly digest → siblings claim tasks in-app → every cross-site fetch shows source + timestamp provenance. Tools: `scopes.grantConsentPerSite`, `aggregate.pullUpcomingAppointments`, `digest.composeWeekly`, `tasks.claimAndAssign`, `provenance.showFetchLog`. Why WebMCP: the parent's data lives in clinic/pharmacy/insurance portals reachable only via the browser's authenticated sessions — no API could aggregate it lawfully or technically. Demo beat: three sibling cursors divide 11 tasks while the fetch log proves exactly what was read, from where. Risk: multi-login setup friction during a 3-minute demo.
21. **RefillRail** — Caregivers tracking 8 medications across 3 pharmacies. Loop: agent inventories current fills from pharmacy portals → projects run-out dates → proposes consolidated refill runs → stages each cart for caregiver approval → flags anything needing prescriber contact (human does that part). Tools: `rx.inventoryAcrossPharmacies`, `dates.projectRunout`, `cart.stageRefillBatch`, `approvals.gateEachOrder`, `prescriber.draftRenewalRequest`. Why WebMCP: checkout lives inside each pharmacy's session; batching requires cross-tab state plus explicit per-order consent gates. Demo beat: a wall calendar of colored pills self-populates with refill dates, and two carts check out on command. Risk: pharmacy anti-automation measures.
22. **RespiteFinder** — Burnt-out caregivers who don't know respite care exists. Loop: caregiver describes situation → agent searches state/county respite programs in-tabs, checks published eligibility → ranks realistic options with wait times → drafts one application at a time for review. Tools: `programs.searchRespiteServices`, `eligibility.checkPublishedCriteria`, `rank.byWaitTimeAndFit`, `application.draftOneAtATime`, `notes.saveCaregiverContext`. Why WebMCP: program finders are awful county web forms; the emotional relief lands when the human sees real openings appear in the actual provider UI. Demo beat: "You haven't had a weekend since March" → two viable respite options with April start dates, application half-drafted. Risk: sparse program data outside pilot counties.
23. **HandOverHand** — Seniors learning new websites (banking, telehealth) who fear breaking things. Loop: learner grants scoped "show me" control → agent performs ONE step while narrating → hands back ("your turn") → verifies the learner's attempt before advancing; every agent touch is listed in a session receipt. Tools: `tutor.beginScopedSession`, `step.performWithNarration`, `handoff.waitForLearnerAttempt`, `verify.checkLearnerAction`, `receipt.summarizeTouches`. Why WebMCP: the tutor acts through the target site's own registered tools on the learner's logged-in session — the exact scenario WebMCP's consent model was built for. Demo beat: a 78-year-old successfully schedules their first video doctor visit, with the agent literally letting go of the mouse mid-flow. Risk: demo needs a believable learner persona/pacing.
24. **CliffEdge** — Benefit recipients afraid a raise will cost them healthcare/housing aid. Loop: with consent, agent reads current benefit determinations from state portals → user drags wage sliders → agent recomputes cliff scenarios against program rules shown inline → generates a "report this change later" prep pack. Tools: `benefits.readCurrentDeterminations`, `sim.modelWageScenarios`, `rules.citeProgramThresholds`, `chart.plotBenefitCliff`, `pack.prepareChangeReport`. Why WebMCP: determinations exist only inside authenticated state portals; showing real numbers next to real sliders is the entire product. Demo beat: dragging salary from $15→$18/hr shows SNAP dip but Medicaid hold — panic replaced with a plan. Risk: rule-computation correctness across programs; scope to one state.
25. **ApplyDiff** — Job seekers mass-applying without losing authenticity. Loop: user maintains one master profile → agent tailors resume/answers per posting → presents a red/green diff per field → user accepts/rejects hunks → submits via ATS only after full-diff sign-off. Tools: `profile.loadMasterResume`, `tailor.adaptToPosting`, `diff.presentFieldChanges`, `hunks.acceptRejectIndividually`, `ats.submitApprovedVersion`. Why WebMCP: ATS forms are bespoke DOMs; the diff-review UI lives beside the real form so approval is literal, not abstract. Demo beat: one profile spawns three tailored applications, each with a satisfying chunk-by-chunk accept animation. Risk: ATS diversity (Greenhouse/Lever/Workday).
26. **AccommodateMe** — Disabled employees unsure how to request workplace accommodations. Loop: employee describes the barrier → agent searches their employer's actual intranet handbook + JAN-style resource library in-tabs → drafts a request memo naming the interactive process steps → tracks employer responses in a timeline. Tools: `handbook.searchEmployerPolicy`, `resources.findAccommodationExamples`, `memo.draftRequestLetter`, `timeline.logInteractiveProcess`, `followup.remindIfSilent`. Why WebMCP: the employer's policy wiki is authenticated intranet content; citing *their* words is what gives the memo weight. Demo beat: a vague worry becomes a confident memo quoting the company's own accommodation policy section 4.2. Risk: demo requires faking an intranet convincingly.
27. **SteadyBase** — Gig workers whose income is scattered across Uber/DoorDash/etc. when applying for housing or aid. Loop: worker logs into each gig app once → agent reads earnings summaries via in-page tools → normalizes into one verified income statement → packages it for a landlord/agency form with per-source consent toggles. Tools: `earnings.summarizeFromGigSites`, `income.normalizeStatements`, `consent.togglePerSource`, `packet.assembleProofOfIncome`, `form.prefillRentalApplication`. Why WebMCP: gig platforms expose earnings only inside their authenticated web apps; aggregation is impossible server-side without credentials. Demo beat: four app tabs collapse into one clean income packet a landlord would actually accept. Risk: gig sites' DOM churn.
28. **WelcomeKit** — Newcomers (immigrants/refugees) facing 10 unconnected enrollment processes in a new city. Loop: newcomer picks goals (school ID, transit pass, library, food assistance) → agent sequences dependencies, opens each official portal → pre-fills shared answers, pauses for document uploads the human must make → celebrates completed milestones on a journey map. Tools: `journey.sequenceEnrollmentSteps`, `answers.reuseAcrossForms`, `upload.pauseForHumanDocuments`, `progress.markMilestoneDone`, `translate.explainEachStep`. Why WebMCP: each agency has its own clunky portal; the shared-answers memory plus visible step-by-step progress is only possible acting inside them. Demo beat: an overwhelming wall of 10 logos becomes 4 done, 2 ready-for-you, 4 queued — in 2 minutes. Risk: breadth; must ruthlessly scope to one city.
29. **CaseCompass** - Immigrant families tracking USCIS cases in a fog of receipt numbers. Loop: family adds receipt numbers → agent checks official case-status pages on schedule → translates notices into plain language with timeline context → flags approaching deadlines (fingerprints, RFE responses) → stages InfoPass/e-request actions for explicit approval. Tools: `status.pollReceiptNumbers`, `notice.translatePlainLanguage`, `timeline.mapProcessingContext`, `deadlines.alertApproaching`, `action.stageERequestDraft`. Why WebMCP: USCIS case status and e-requests are session-gated web flows; families share one watch-view while the agent works the official site only. Demo beat: a cryptic "Request for Evidence" notice arrives and instantly gets translated into a deadline ring countdown with a drafted-response checklist. Risk: anxiety-inducing domain demands flawless tone; strictly non-legal.
30. **FreshStart** - Returning citizens navigating record-cleanup and license reinstatement paperwork. Loop: user enters their jurisdictions → agent reads court/DMV portal guidance, builds an eligibility-aware task DAG (fearsome paperwork becomes ordered steps) → drafts fee-waiver and records-request forms → user files each through the portal with agent-side checklist verification. Tools: `records.checkCourtPortalGuidance`, `dag.buildCleanupSteps`, `forms.draftFeeWaiver`, `filing.walkThroughSubmission`, `checklist.verifyBeforeNextStep`. Why WebMCP: court e-filing portals are notoriously stateful; the checklist verifying "what the portal now says" prevents catastrophic missteps. Demo beat: a 5-year tangle of fines and records resolves into "3 filings ready" with fees waived via drafted forms. Risk: high stakes require heavy disclaimers and careful county scoping.

---

## TOP 5

1. **CliffEdge (#24)** — The single clearest "impossible without the browser" pitch: real determination data + real-time sliders = instant judge comprehension and huge impact.
2. **AppealAid (#15)** — Emotionally explosive demo (denial→submitted appeal) with citation-provenance that showcases consent, reversibility, and multi-portal WebMCP leverage.
3. **HandOverHand (#23)** — Purest expression of WebMCP's consent model ("agent performs one step, hands back") and the most emotionally memorable 3 minutes possible.
4. **DischargeDeck (#19)** — Universal "oh no" moment transformed into visible multi-portal choreography; logistics-only framing dodges medical-advice landmines.
5. **EmberPlan (#10)** — Live map-driven family coordination is viscerally compelling, technically showy (GIS tools in-page), and squarely on the resilience brief.

---

## Batch 4: Developer tools, operations, security, and compliance

# Ideation Agent 4 — 30 WebMCP Challenge Concepts

**Design thesis:** The winning pattern treats the web app as the agent's *cockpit*, not its target: agents do sweeping, scoring, and drafting; humans do judgment through selections, previews, and gates embedded in the same DOM. Every mutation should be a two-phase propose→approve exchange where the tool returns a preview handle rendered in-page, not a committed result. All 30 ideas below are chosen because their core loop is impossible from a CLI or backend API — they depend on the human's authenticated session, live on-screen state, and visual sign-off.

---

**1. Autopsy Room** — CI failure triage surgeon
- **Who/problem:** Platform engineers drowning in failed pipelines with no time to bisect.
- **Loop:** Agent pulls failures, clusters root causes, annotates them directly onto the pipeline DAG; engineer selects a suspected commit; agent stages a revert PR whose diff renders beside the failing log; approve → PR opens, jobs re-run.
- **Tools:** `get_pipeline_failures`, `fetch_job_log_tail`, `bisect_suspect_commits`, `stage_revert_pr`, `rerun_selected_jobs`
- **Why browser:** Root-cause pins land on the visual DAG; approval happens where triage already lives; no CI token sprawl — the session is the credential.
- **Demo beat:** Red pipeline → agent pins culprit commit on the DAG → one click ships a green revert PR in 90 seconds.
- **Risk:** Log noise vs. context limits; needs realistic failing-run fixtures.

**2. Flake Ward** — flaky test quarantine warden
- **Who/problem:** Test maintainers; flakes erode CI trust while quarantine lists rot forever.
- **Loop:** Agent correlates pass/fail history into failure fingerprints shown side-by-side as evidence cards; human toggles which tests enter the ward; agent files the quarantine config PR plus auto-expiry review tickets.
- **Tools:** `get_flake_statistics`, `compare_failure_fingerprints`, `propose_quarantine_batch`, `schedule_expiry_review`
- **Why browser:** Fingerprint diffs and flame charts are visual artifacts; batch selection is UI-native toggling.
- **Demo beat:** Three red suites → agent proves two share one fingerprint → both quarantined with 30-day expiry → suite goes green.
- **Risk:** Convincing stats need enough seeded historical runs.

**3. Bump Conductor** — dependency upgrade orchestration
- **Who/problem:** Maintainers months behind on major-version bumps fearing breakage.
- **Loop:** Agent batches upgrades by risk and runs compatibility probes; results stream into a live lane matrix (merge-now / watch / reject); human drags bumps between lanes mid-run; agent opens stacked PRs for approved lanes.
- **Tools:** `list_outdated_dependencies`, `run_compatibility_probe`, `annotate_breaking_changes`, `open_upgrade_pr`
- **Why browser:** Dragging items between lanes while probe results stream in-place is a UI operating loop, not an API call.
- **Demo beat:** 40 outdated deps probed → human drags 6 safe majors to "merge" → stacked green PRs open.
- **Risk:** Probe runtime; pre-bake sandbox builds for the demo.

**4. Flag Undertaker** — feature flag debt cleanup
- **Who/problem:** Product teams with hundreds of stale flags nobody dares remove.
- **Loop:** Agent traces flag usage across code and analytics, rendering blast-radius cards that overlay exact code regions and traffic share; human selects flags to retire; agent stages grouped removal PRs with flipped-default simulation.
- **Tools:** `scan_flag_references`, `get_flag_exposure_stats`, `simulate_flag_defaults`, `stage_flag_removal_pr`
- **Why browser:** Blast-radius highlights overlay the real code view; retirement requires seeing traffic percentages inline.
- **Demo beat:** Agent finds 3 dead flags with 0% exposure overlays → retirement PRs open → app boots fine with defaults flipped.
- **Risk:** Cross-repo static analysis is hard; scope to one monorepo fixture.

**5. Revert Cockpit** — bad-deploy rollback coordination
- **Who/problem:** On-call engineers fumbling rollbacks under pressure.
- **Loop:** Agent correlates error-rate spikes with recent deploys and ranks rollback candidates by blast radius; human picks one; cockpit walks staged traffic-shift steps, each requiring a confirm bound to live health gauges; auto-abort if SLOs regress.
- **Tools:** `correlate_deploy_with_regression`, `plan_rollback_steps`, `advance_rollback_step`, `watch_error_budget`
- **Why browser:** Step-by-step traffic visualization with confirms tied to visible gauges makes each advance an informed human act.
- **Demo beat:** Injected error spike → agent ranks culprits → human walks a 3-step rollback while graphs visibly flatten.
- **Risk:** Needs a scriptable fake production with believable metrics.

**6. Incident Loom** — timeline weaving & postmortems
- **Who/problem:** Incident commanders who reconstruct timelines from memory days later.
- **Loop:** While humans fight the fire, the agent ingests activity from open Slack/GitHub/metrics tabs into a timestamped side-panel timeline; IC drags items between "fact" and "noise"; at resolution the agent drafts the postmortem from curated facts only.
- **Tools:** `ingest_tab_activity`, `build_incident_timeline`, `reclassify_timeline_item`, `draft_postmortem`
- **Why browser:** Aggregating across authenticated tabs is structurally impossible server-side; curation is drag-and-drop.
- **Demo beat:** Replay a 10-minute scripted incident → timeline fills live → drag two noisy items out → polished postmortem appears.
- **Risk:** Cross-tab access constraints; may need same-origin mock apps.

**7. Status Page Cockpit** — incident comms commander
- **Who/problem:** Comms leads writing updates blind while engineering fights the fire.
- **Loop:** Agent watches internal health signals and drafts component-status changes + update copy tagged with confidence levels in the actual WYSIWYG editor; lead edits inline and approves; agent publishes and tracks subscriber reactions on a split screen.
- **Tools:** `get_health_signals`, `draft_status_update`, `set_component_severity`, `publish_update`
- **Why browser:** Drafting happens inside the real status-page editor; publishing rides the human's authenticated session.
- **Demo beat:** Incident starts → severity-suggested draft materializes in the editor → edit one sentence → publish → public page flips on the other half of the screen.
- **Risk:** Risk of feeling thin; differentiate on severity-suggestion accuracy.

**8. Shift Handoff Binder** — on-call handoff assembly
- **Who/problem:** On-call pairs losing context at shift boundaries.
- **Loop:** Agent compiles open threads, silenced alerts, and half-finished investigations into a binder; incoming engineer marks items acknowledged/questions; agent files follow-ups and pings owners.
- **Tools:** `collect_shift_activity`, `summarize_open_threads`, `mark_handoff_item_acknowledged`, `create_followup_task`
- **Why browser:** Binder entries deep-link into live consoles; acknowledgment state lives in the UI, not a ticket queue.
- **Demo beat:** End-of-week handoff assembled in 30 seconds; incoming engineer clicks three items, asks one question, follow-up auto-files.
- **Risk:** Summarization quality over messy thread data.

**9. Dunning Desk** — failed-payment recovery
- **Who/problem:** Finance ops leaking revenue on failed charges handled by generic retry cron jobs.
- **Loop:** Agent segments failed charges by failure code and customer value, proposes a dunning ladder (retry timing, email tone) as sortable cards; finance tweaks offers per tier (grace periods, win-back discounts) and approves sends with inline email previews.
- **Tools:** `segment_failed_payments`, `propose_retry_schedule`, `draft_recovery_email`, `approve_send_batch`
- **Why browser:** Card queue with pixel-perfect email previews beside billing history; approvals consume the billing session.
- **Demo beat:** $12k of failed charges tiered in 20 seconds; human upgrades one VIP to white-glove; batch fires with simulated recovery outcomes ticking up.
- **Risk:** Real outcomes aren't visible in 3 minutes; simulate credibly.

**10. Departure Vault** — customer offboarding auditor
- **Who/problem:** SaaS teams offboarding churned tenants with no defensible deletion record.
- **Loop:** Agent inventories tenant data across modules, stages a browsable export bundle plus a purge plan flagging legal holds; CS confirms each destructive stage via visible checkboxes; vault seals with a signed hash receipt.
- **Tools:** `inventory_tenant_data`, `stage_export_bundle`, `flag_legal_holds`, `execute_purge_stage`, `issue_deletion_receipt`
- **Why browser:** Browsing export contents in-app *before* anything deletes; destruction gated behind checkboxes in the same view.
- **Demo beat:** Full offboarding arc: browse the export → check three purge stages → receipt PDF with content hashes prints out.
- **Risk:** Breadth of modules; keep to three realistic ones.

**11. Price Wave Rider** — pricing change rollout
- **Who/problem:** Revops terrified of big-bang price changes churning customers.
- **Loop:** Agent simulates a price change across all accounts, renders wave cards ($ impact, churn risk, grandfather options); revops drags accounts into waves; launching a wave shows before/after sample invoices for final approval.
- **Tools:** `simulate_price_impact`, `group_accounts_into_waves`, `preview_sample_invoices`, `launch_wave`
- **Why browser:** Sample invoices render in the real invoice template; wave composition is inherently drag-based.
- **Demo beat:** +9% price → three risk-sized waves → inspect three sample invoices → launch wave 1 live.
- **Risk:** Simulation realism depends entirely on a well-seeded dataset.

**12. Seat Auditor** — entitlement drift reconciler
- **Who/problem:** SaaS vendors losing revenue to seat overuse and ghost accounts.
- **Loop:** Agent diffs active users vs licensed seats vs usage patterns, clustering anomalies onto an org-chart/heatmap view; human marks violators vs. legit edge cases node-by-node; agent drafts outreach or entitlement fixes.
- **Tools:** `diff_usage_vs_entitlement`, `cluster_user_activity`, `flag_ghost_accounts`, `draft_entitlement_change`
- **Why browser:** Activity heatmaps and clickable org charts make cluster judgment possible; decisions attach to chart nodes.
- **Demo beat:** Tenant with 214 seats but 261 actives → clusters glow → convert 40 to paid, disable 7 ghosts, in two clicks.
- **Risk:** Privacy optics; use synthetic usage data.

**13. Refund Bench** — refund adjudication queue
- **Who/problem:** Support leads with refunds stalling waiting for policy judgment.
- **Loop:** Agent pre-adjudicates requests against policy + order history, stacking approve/deny/escalate cards citing exact clauses; human flips any verdict and watches which clause fires highlight; batch executes against the ledger.
- **Tools:** `fetch_dispute_context`, `score_against_refund_policy`, `set_verdict`, `execute_refund_batch`
- **Why browser:** Verdict cards sit atop the real order timeline; clause-highlighting on flip is DOM behavior.
- **Demo beat:** 15 queued refunds scored in seconds; human flips two, approves the rest; ledger ticks live.
- **Risk:** Policy engine depth; keep rules few and transparent.

**14. Migration Choreographer** — schema migration gating
- **Who/problem:** Backend teams shipping risky DB migrations on Friday afternoons.
- **Loop:** Agent drafts the migration, runs it against a shadow copy, renders sampled row-level diffs and lock-window estimates on a gate rail (dev→staging→prod); human promotes each gate only when shadow metrics look sane, with expandable backout plans.
- **Tools:** `draft_migration_plan`, `run_shadow_migration`, `sample_row_diffs`, `estimate_lock_window`, `promote_environment_gate`
- **Why browser:** Expandable diff trees, gate progress rail, and promote-buttons disabled until panel metrics pass — all in-context judgment.
- **Demo beat:** Add-column-with-backfill walked dev→prod in two minutes, inspecting sampled diffs at staging.
- **Risk:** Shadow-DB infra at hackathon scale; use a pre-seeded snapshot.

**15. Backfill Babysitter** — long data backfill supervision
- **Who/problem:** Data engineers babysitting multi-hour backfills in terminal tabs.
- **Loop:** Agent chunks the backfill and streams progress onto a live chunk map; periodically surfaces sampled before/after rows for spot-check; human pauses, tunes batch size, or quarantines poisoned ranges from the map.
- **Tools:** `plan_backfill_chunks`, `stream_backfill_progress`, `sample_transformed_rows`, `pause_or_tune_backfill`
- **Why browser:** The chunk map coloring in real time plus inline sampling modals is a supervision cockpit, not a job runner.
- **Demo beat:** 100k-row backfill at 50x speed; one bad chunk flagged by sampling, quarantined; rest completes green.
- **Risk:** Long jobs don't fit 3 minutes; time-compress honestly.

**16. PII Cartograph** — PII mapping & redaction sign-off
- **Who/problem:** Data teams afraid to share datasets because they can't prove what's sensitive.
- **Loop:** Agent scans schema + samples, painting a PII heatmap over every column; human reclassifies flagged columns via dropdowns; agent generates redaction transforms with before/after row previews; export locks until the map is signed.
- **Tools:** `scan_dataset_for_pii`, `update_column_classification`, `preview_redaction_samples`, `export_redacted_dataset`
- **Why browser:** Heatmap overlays on the data grid plus visual classification drive the transform; nothing leaves without signature.
- **Demo beat:** 40-column table scanned in 15 seconds → fix 3 misclassifications → preview masked rows → signed export.
- **Risk:** Classifier accuracy; seed obvious plus genuinely tricky cases.

**17. Breach Broker** — data contract breakage negotiation
- **Who/problem:** Data platforms where one upstream rename silently breaks five teams.
- **Loop:** On schema drift, agent maps impacted contracts and downstream queries, opening negotiation cards pinned to lineage-graph edges: producer proposes fix, consumers accept/waive/request-change with votes visible on the graph; resolved plan emits a fix PR.
- **Tools:** `detect_schema_drift`, `map_downstream_impact`, `submit_contract_proposal`, `vote_on_waiver`, `emit_fix_pr`
- **Why browser:** Lineage graph nodes lighting up with vote states is the collaboration surface; votes attach to graph edges.
- **Demo beat:** Column renamed → five consumer nodes flare red → three accept the auto-fix, two waive → merged fix PR.
- **Risk:** Lineage fidelity; constrain to one warehouse mock.

**18. Query Twin** — BI query rewrite differ
- **Who/problem:** Analytics engineers with 14-second dashboard queries nobody trusts to touch.
- **Loop:** Agent generates rewrite candidates, executes old and new, streams twin result grids with cell-by-cell diff verdict and runtime bars; human scrolls both grids to eyeball equivalence, accepts swap; dashboard repoints atomically.
- **Tools:** `profile_query_plan`, `generate_rewrite_candidates`, `run_result_diff`, `swap_dashboard_query`
- **Why browser:** Side-by-side scroll-synced grids comparing results is a visual-equivalence judgment no API response conveys.
- **Demo beat:** 14s query → twin rewrite runs in 0.8s with identical grid → swap applied, dashboard reloads fast.
- **Risk:** Proving semantic equivalence convincingly; cap dataset size.

**19. Detonation Bench** — phishing triage workbench
- **Who/problem:** SOC analysts triaging reported phish across disconnected tools.
- **Loop:** Analyst drags suspect mail into the bench; agent detonates links safely, overlaying verdict badges on the email body itself; analyst selects IOCs; agent stages block rules with recipient-overlap heatmap preview ("200 others got this") for commit.
- **Tools:** `detonate_url_safely`, `extract_iocs`, `search_recipient_overlap`, `stage_block_rules`, `commit_blocks`
- **Why browser:** Verdict badges anchor to the email DOM; blocks commit under the analyst's own session boundary.
- **Demo beat:** Live phish → landing-page screenshot + 3 IOCs extracted → one click blocks the domain for 200 targeted recipients.
- **Risk:** Safe detonation infrastructure; use canned static captures.

**20. Key Carousel** — secrets rotation choreography
- **Who/problem:** Security teams with leaked or ancient credentials nobody dares rotate.
- **Loop:** Agent maps the secret-usage dependency graph, mints replacements, and stages dual-read windows; the human approves each consumer cutover while watching live canary success rates. The burn button stays locked until canaries go green, then destroys the old key with an audit receipt.
- **Tools:** `map_secret_usage_graph`, `mint_replacement_secret`, `enable_dual_read_window`, `cut_over_consumer`, `burn_old_secret`
- **Why browser:** The usage graph animates cutover node-by-node; the burn button is visibly locked until the canary panel reads green — permission-as-visible-state.
- **Demo beat:** Leaked AWS key rotated across four services in ~2 minutes, ending in a burn animation + audit receipt.
- **Risk:** Mocking cloud KMS convincingly; abstract behind a provider shim.

**21. Privilege Sculptor** — IAM least-privilege carving
- **Who/problem:** Cloud security engineers facing over-permissive roles nobody will trim for fear of breakage.
- **Loop:** Agent diffs granted-vs-observed permissions over 90 days and sculpts a minimal policy rendered as colored chips falling off a role card; human re-adds any chip they know is seasonal; agent stages the policy PR with an inline predicted-breakage report.
- **Tools:** `analyze_permission_usage`, `sculpt_minimal_policy`, `predict_policy_breakage`, `stage_policy_diff`
- **Why browser:** Chips flying off a role card is visceral risk communication; seasonal re-add is one click on visible state.
- **Demo beat:** God-mode S3 role loses 47 of 52 actions → human re-adds one quarterly-batch chip → staged PR shows zero predicted breakage.
- **Risk:** Usage-log availability; fabricate CloudTrail-like logs.

**22. Perimeter Diff** — attack surface drift watcher
- **Who/problem:** Security teams whose real exposed perimeter diverges silently from inventory.
- **Loop:** Agent diffs live perimeter scans against inventory, flagging new hosts/certs/ports as pulsing assets on a map/grid; human triages each as owned/unknown/hostile; agent files issues or DNS claims accordingly and keeps watching flagged assets for churn.
- **Tools:** `enumerate_live_perimeter`, `diff_against_inventory`, `classify_new_asset`, `file_asset_issue`, `watch_asset_churn`
- **Why browser:** Map-based triage stamps applied visually; watching state persists in the app where the human judged.
- **Demo beat:** Surprise subdomain appears → marked unknown → cert reveals forgotten marketing staging box → issue filed, asset watched.
- **Risk:** External scanning is slow/legally fraught; scan your own lab range.

**23. DSAR Line** — data-subject-request assembly line
- **Who/problem:** Privacy ops fulfilling GDPR/CCPA access requests by hand across a dozen SaaS tools.
- **Loop:** Officer registers the request; agent sweeps connected apps open in browser tabs (CRM, support, analytics), piling matching artifacts into a review queue; officer redacts by brushing regions and approves item-by-item with hover previews; sealed bundle exports with a chain-of-custody log.
- **Tools:** `register_dsar_request`, `sweep_connected_apps`, `collect_matching_artifacts`, `redact_artifact_region`, `seal_request_bundle`
- **Why browser:** The integration layer IS the human's logged-in sessions — no API credentials, no connectors; redaction is visual region selection on live artifacts.
- **Demo beat:** One request → 23 artifacts swept from four mock apps in 60 seconds → three brush-redactions → sealed ZIP + custody log prints.
- **Risk:** Cross-tab sweep mechanics; use WebMCP `exposedTo` between your own mock app origins.

**24. Consent Ledger** — tracker truth audit
- **Who/problem:** Compliance teams whose consent banner lies — tags fire before consent anyway.
- **Loop:** Agent loads the site with consent denied, enumerates every network call/cookie/tag actually firing, and overlays violations directly on the page ("chat widget fired 4 trackers pre-consent"); human confirms each violation in place; agent drafts remediation tickets and regenerates a corrected consent config.
- **Tools:** `crawl_with_consent_state`, `enumerate_third_party_calls`, `overlay_violations`, `file_consent_ticket`, `regenerate_consent_config`
- **Why browser:** Only live in-browser observation catches tag-manager ghosts and dynamically injected scripts; overlay-on-DOM is uniquely possible here — a crawler or CLI can't do this.
- **Demo beat:** Homepage audited live → five pre-consent trackers glow red on the actual page → tickets + fixed config generated.
- **Risk:** Third-party scripts behaving differently headless; record canned sessions as fallback.

**25. Evidence Locker** — continuous SOC2 evidence collection
- **Who/problem:** Startup compliance leads scrambling at audit time for scattered evidence.
- **Loop:** Agent patrols controls, snapshotting artifacts (access reviews, MFA attestations, backup logs) into locker cards stamped with time/hash badges; auditor mode requests samples; human signs each control period via a checklist one click deep into actual evidence; gaps auto-raise tickets.
- **Tools:** `snapshot_control_evidence`, `hash_and_seal_artifact`, `request_auditor_sample`, `sign_control_period`, `raise_gap_ticket`
- **Why browser:** The signing ritual happens in-app with evidence one click deep; hash-sealed badges make tamper-evidence visible.
- **Demo beat:** Month-end close: 12 controls snapshotted, 1 gap found (offboarded employee still in VPN log), ticket raised, 11 signed — in 90 seconds.
- **Risk:** Dashboard-feel; keep emphasis on agent-gathering + signing loop.

**26. Paper Gap** — vendor security document review
- **Who/problem:** Procurement/security reviewers drowning in 80-page vendor SOC2s and DPAs.
- **Loop:** Drop the PDF; agent extracts claims, maps them against your control questionnaire, renders gap cards citing exact paragraphs — click a gap and the rendered PDF scrolls to the citation; human rebalances criticality sliders; agent drafts the renegotiation letter from accepted gaps.
- **Tools:** `parse_vendor_package`, `map_claims_to_controls`, `highlight_pdf_evidence`, `adjust_control_weights`, `draft_remediation_letter`
- **Why browser:** Citation anchoring to the rendered PDF viewport is DOM-native judgment; sliders drive agent re-prioritization live.
- **Demo beat:** 80-page SOC2 digested in 45 seconds → six paragraph-cited gaps → sliders rebalanced → letter drafted.
- **Risk:** PDF extraction quality; pick clean sample documents.

**27. Healer** — broken E2E test repair
- **Who/problem:** QA maintainers whose Playwright/Cypress suites shatter after every redesign.
- **Loop:** Agent replays failing specs, locates where selectors died, proposes healed locators with side-by-side video frame diffs highlighting old vs. new elements; human approves heals individually or bulk; suite re-runs green with step lights.
- **Tools:** `replay_failing_spec`, `locate_broken_selector`, `propose_healed_locator`, `render_frame_diff`, `apply_heals_and_rerun`
- **Why browser:** Frame diffs and element highlighting are inherently browser-native; approval sits on the exact frame that failed.
- **Demo beat:** Twelve specs broken by a navbar redesign → healed in bulk with frame proof → suite green in under two minutes.
- **Risk:** Deterministic replay; freeze app version and seed recordings.

**28. Journey Forge** — record-a-flow test synthesis
- **Who/problem:** QA teams without coders who still need E2E coverage.
- **Loop:** Human performs checkout once while capture records; agent generalizes into parameterized steps rendered as editable storyboard cards; human edits assertions via dropdowns on each card; agent executes the forged test live with per-step pass lights.
- **Tools:** `start_capture_session`, `synthesize_test_storyboard`, `edit_step_assertion`, `execute_storyboard`, `report_step_results`
- **Why browser:** Capture consumes real input events in the live authenticated app; storyboard editing is pure UI co-authorship.
- **Demo beat:** Record a 40-second checkout → nine-step storyboard materializes → tweak price assertion → test passes with green step lights.
- **Risk:** Robust selectors from raw events; constrain to a well-marked demo app.

**29. Chase Ladder** — invoice escalation ladder
- **Who/problem:** Small-business owners awkwardly chasing overdue invoices by hand.
- **Loop:** Agent ranks overdue invoices by age/amount/relationship heat and builds tone-laddered chase sequences (friendly nudge → firm → final notice) as editable drafts beside each customer's history; owner approves or softens rungs; replies thread back onto the board, auto-adjusting urgency.
- **Tools:** `rank_overdue_invoices`, `draft_chase_sequence`, `approve_dispatch`, `thread_customer_reply`
- **Why browser:** Drafts render next to full customer context inside the invoicing app; sending rides the owner's own mailbox session.
- **Demo beat:** Nine overdue invoices → ladders built in 20 seconds → owner edits one, approves rest → simulated reply arrives and escalates automatically.
- **Risk:** Feeling spammy; showcase restraint rules (skip customers paying tomorrow).

**30. Payroll Preflight** — payroll anomaly gate
- **Who/problem:** Bookkeepers who catch payroll errors only after money moves.
- **Loop:** Before the run, agent diffs the period against history and pins anomaly cards (new vendor, doubled hours, terminated employee active) directly to affected payslip lines; bookkeeper resolves each keep/fix/exclude; the run button stays visibly locked until zero cards remain.
- **Tools:** `preflight_payroll_diff`, `attach_anomaly_cards`, `resolve_anomaly`, `verify_run_readiness`, `execute_payroll_run`
- **Why browser:** Cards physically attached to payslip rows; the locked/unlocked button is permission expressed as visible UI state.
- **Demo beat:** Seeded payroll with four planted errors → all caught as cards in 10 seconds → resolved → button unlocks → run executes.
- **Risk:** Anomaly variety; plant diverse error classes in fixtures.

---

## TOP 5

1. **DSAR Line (#23)** — The purest WebMCP play: logged-in tabs are the integration layer, visual redaction is the approval, and compliance pain makes impact obvious.
2. **Healer (#27)** — Frame-diff healing is instantly legible "whoa" footage, deeply browser-bound, and deterministically executable within hackathon constraints.
3. **Key Carousel (#20)** — High-stakes security narrative where staged approvals, canary gates, and the locked burn button dramatize the human-agent trust loop perfectly.
4. **Consent Ledger (#24)** — Live on-page violation overlays prove a capability no crawler, CLI, or backend API can replicate — WebMCP leverage is the demo.
5. **Migration Choreographer (#14)** — Shadow-run row diffs plus environment gates exhibit the deepest propose→inspect→approve loop with broad developer resonance.

---

## Batch 5: Wildcard and WebMCP-native interaction patterns

# Ideation Batch — Agent 5 of 5

**Design thesis:** WebMCP's real unlock isn't "agents use websites" — it's that a tool schema becomes a *shared interface* between two intelligences looking at the same visible state. The strongest entries won't hide the agent in a chat panel; they'll make the registered toolset the actual game board, instrument panel, or treaty table — with previews, consent gates, and undo making agent boldness safe to watch live. Build apps where removing `document.modelContext.registerTool` would break the experience entirely, not merely inconvenience it.

---

1. **Blind Cartographer**
   - **Who/problem:** Co-op puzzle gamers; asymmetric-info games need a trusted referee.
   - **Loop:** Agent sees canonical island data (structured terrain grid); human sees only a blank canvas and paints what they believe. Agent answers spatial questions via tools ("is there water within 3 tiles of me?"), never revealing the raw grid; win condition requires human-drawn map to match within tolerance.
   - **Tools:** `probe_terrain(x,y,radius)`, `ask_direction(question)`, `submit_map_sketch(cells)`, `reveal_mismatch_region()`, `start_new_island(seed)`
   - **Why WebMCP:** Tools enforce information asymmetry — the agent *cannot* cheat because it only has typed probes, not pixels; the canvas is the only rendering of ground truth.
   - **Demo beat:** Judge watches agent guide a blindfolded human artist to a 92% map match, then the mismatch region flashes red and they fix it in 30 seconds.
   - **Risk:** Tuning probe answers to be helpful-but-not-solving is genuine game-design work.

2. **Puppet Parliament**
   - **Who/problem:** Party-game players who want social deduction (Werewolf-style) without a moderator.
   - **Loop:** 4–6 human tabs join one room; agent NPCs hold hidden roles and negotiate through structured proposals (`accuse(player, reason)`, `propose_vote(target)`). Humans see a live debate stage with speech bubbles; the agent's private reasoning stays server-side, only its *actions* flow through tools.
   - **Tools:** `cast_accusation(target, statement)`, `table_motion(text)`, `vote(motion_id, yes_no)`, `reveal_role()`, `advance_day_phase()`
   - **Why WebMCP:** Every NPC move is a validated structured event rendered into shared UI — no free-text chat to parse, so humans and agents negotiate on equal footing.
   - **Demo beat:** Two judges plus three agent senators; the agents successfully gaslight a human into voting out an innocent — audible laughter, clear game loop.
   - **Risk:** NPC dialogue quality carries the whole experience; weak LLM persona = dead room.

3. **Orders Not Clicks**
   - **Who/problem:** RTS/tactics fans who find micro-management tedious; wants command-layer play.
   - **Loop:** Human issues high-level orders ("take the eastern bridge, avoid casualties"); agent decomposes them into unit-level moves via tools, each batched as a *previewable plan*. Human scrubs a replay timeline of the proposed turn, edits any single unit order, then commits. Full undo per phase.
   - **Tools:** `draft_turn_plan(objective, constraints)`, `inspect_plan_step(step_id)`, `amend_unit_order(unit_id, order)`, `commit_plan()`, `rollback_to_phase(n)`
   - **Why WebMCP:** Plans arrive as typed structures the UI renders as editable overlays — impossible with screenshot-clicking agents; `destructiveHint` on `commit_plan` triggers native confirmation UX.
   - **Demo beat:** Agent plans a flanking maneuver in ~10s, human spots one suicide charge on the preview timeline, amends it, commits, watches the battle resolve.
   - **Risk:** Simulating believable combat outcomes in 8 days; scope to a hex-grid skirmish.

4. **Polis**
   - **Who/problem:** Policy students/journalists; epidemic sims are opaque knobs, not dialogues.
   - **Loop:** Human governs a city on a live district map; agent proposes interventions as structured bills (`close_transit(districts, days)`), each rendered with projected curves *before* signing. Human can counter-propose, and agent critiques using simulation reads.
   - **Tools:** `propose_policy(type, params, duration)`, `preview_policy_impact(policy_id)`, `enact_policy(policy_id)`, `repeal_policy(id)`, `query_district_stats(district)`
   - **Why WebMCP:** Policies are typed payloads with previews and repeal — reversibility is structural, not a promise; the visible map updates from the same state the tools mutate.
   - **Demo beat:** Agent proposes a targeted school closure, impact preview shows cases −40% vs. lockdown's economic cost; human signs, curve bends on screen.
   - **Risk:** SEIR model fidelity vs. runtime speed; keep it stochastic-simple but responsive.

5. **Estuary**
   - **Who/problem:** Watershed educators/restoration planners; hydrology tools are expert-only.
   - **Loop:** Human places wetlands, levees, culverts on an interactive watershed cross-section; agent runs flood scenarios via tools and annotates the canvas with failure points, then negotiates a redesign.
   - **Tools:** `run_storm_scenario(return_period_years)`, `inspect_flow_node(node_id)`, `place_structure(kind, segment)`, `remove_structure(id)`, `compare_scenarios(a_id, b_id)`
   - **Why WebMCP:** Scenario results return as structured overlays bound to visible geometry; every placement is undoable, encouraging playful experimentation.
   - **Demo beat:** A 100-year storm floods the town; agent flags three levee overtoppings; human adds a retention basin and reruns — water level drops live.
   - **Risk:** Credible-enough hydrology without a physics engine; use simplified cell routing.

6. **Hohmann Yard**
   - **Who/problem:** Space enthusiasts/KSP-adjacent learners; orbital math is a wall.
   - **Loop:** Human drags a ship around a 2D solar system; agent computes transfer burns via tools and renders the trajectory arc *dashed* before human fires engines. Misfires are one-click reverted (time rewinds).
   - **Tools:** `plan_transfer(from_orbit, to_orbit, depart_time)`, `preview_burn(delta_v_vector)`, `execute_burn(burn_id)`, `rewind_time(to_epoch)`, `read_ephemeris(body_id)`
   - **Why WebMCP:** Numeric precision (Δv, phase angles) is exactly what DOM-scraping agents can't do; typed burn plans make the dangerous action previewable and revertible.
   - **Demo beat:** Human fumbles two launches, then asks for Mars transfer — dashed intercept arc appears, one burn executed, arrival confirmed with fuel remaining.
   - **Risk:** Getting patched-conic math right under demo pressure; test with canned scenarios.

7. **Breedery**
   - **Who/problem:** Bio teachers and creature-collector gamers; evolution is invisible at classroom timescales.
   - **Loop:** Human selects visible traits on creatures (speed, armor, camouflage); agent proposes crosses and mutation experiments via genome tools, each offspring rendered instantly with a lineage tree and full undo of any hatch.
   - **Tools:** `cross_breed(parent_a, parent_b)`, `induce_mutation(genome_locus)`, `inspect_genome(creature_id)`, `release_to_environment(creature_id)`, `clone_and_revert(generation_n)`
   - **Why WebMCP:** Genomes as JSON schemas let the agent reason about heritability while the human judges aesthetics on canvas — a genuine split-brain collaboration.
   - **Demo beat:** Predator pressure added; agent breeds a camouflaged line over four visible generations; judge hatches the "perfect" creature and it dominates the pen.
   - **Risk:** Making trait expression legible and delightful rather than spreadsheet-y.

8. **Roommate Treaty**
   - **Who/problem:** Households fighting over rent split and chores; negotiations stall in group chats.
   - **Loop:** Each roommate opens their own tab with private valuations (revealed only via their consent); agent reads all sides through tools and proposes Pareto-improving treaties rendered as side-by-side diff cards per person. Any signer can amend; nothing binds until all e-sign.
   - **Tools:** `submit_private_valuation(item, utility)`, `propose_treaty(allocations)`, `compare_treaties(a,b)`, `sign_treaty(treaty_id)`, `reopen_negotiation(topic)`
   - **Why WebMCP:** Per-origin per-tab sessions give natural *private channels* — the agent mediates without anyone seeing others' numbers until a proposal lands; signatures are destructive-flagged and explicit.
   - **Demo beat:** Three judges enter secret preferences; agent produces a chore/rent split all three sign in 90 seconds after one amendment round.
   - **Risk:** Fairness algorithm quality; a visibly unfair proposal kills the magic.

9. **Table Plan Armistice**
   - **Who/problem:** Wedding/event planners; seating charts are constraint hell with feuding relatives.
   - **Loop:** Hosts drag guests between tables while declaring constraints ("Aunt Mei and Uncle Ray: never adjacent"); agent detects violations via tools and swaps seats with animated previews; both hosts approve or veto each swap batch.
   - **Tools:** `add_constraint(guest_a, guest_b, kind)`, `detect_conflicts()`, `propose_swap(batch_of_moves)`, `apply_seating(batch_id)`, `lock_table(table_id)`
   - **Why WebMCP:** Constraint satisfaction returns structured swap batches the canvas animates — and every batch is atomic + reversible, unlike a text agent editing your file.
   - **Demo beat:** A chart with seven red conflict badges resolves to all-green in two approved swap batches, with one dramatic veto mid-demo.
   - **Risk:** Solver sophistication vs. naive greedy swaps; cap at ~60 guests.

10. **Poker-Face Facilitator**
    - **Who/problem:** Scrum teams; planning poker drifts and dominant voices win.
    - **Loop:** Each dev votes privately in their tab; agent facilitator detects outliers, asks the outlier (via `requestUserInteraction`) for the missing consideration, re-runs consensus, and drafts the sprint commitment for majority sign-off.
    - **Tools:** `open_vote(story_id, scale)`, `record_vote(story_id, points, confidence)`, `surface_outliers()`, `draft_sprint_commitment()`, `finalize_commitment(votes_required)`
    - **Why WebMCP:** Private per-tab votes + a shared rendered board is a genuinely new meeting primitive; the facilitator acts through typed events everyone can audit.
    - **Demo beat:** Votes split 3/8/13; agent extracts the hidden "API dependency" from the 13-voter, vote converges, commitment signed on screen.
    - **Risk:** Needs multiple simultaneous browsers in demo — rehearse the multi-tab choreography.

11. **Consensus Loom**
    - **Who/problem:** Boards/co-ops/community groups choosing among competing proposals.
    - **Loop:** Members weight criteria privately; agent weaves a ranked compromise from all proposals via tools, displaying a Sankey of whose concerns flowed where; members pull individual threads out (objections) and the weave re-renders.
    - **Tools:** `submit_proposal(title, body, tags)`, `weight_criterion(criterion, weight)`, `weave_compromise(proposal_ids)`, `raise_objection(compromise_id, thread, objection)`, `call_final_vote()`
    - **Why WebMCP:** Objections are structured inputs that deterministically reshape the output — the negotiation loop is inspectable end-to-end instead of vibes-in-chat.
    - **Demo beat:** Five rival budget proposals converge into one compromise in 2 minutes; the judge raises one objection and watches the ranking flip.
    - **Risk:** Synthesis quality across arbitrary proposals; constrain to a template schema.

12. **Escalation Booth**
    - **Who/problem:** Automation-heavy teams; agents silently fail on judgment calls.
    - **Loop:** An agent worker processes tickets through registered tools; when confidence drops, it files a structured *handoff card* (context, options taken, decision needed) that renders as a rich queue item; human decides via buttons; resolution flows back and the agent resumes mid-task, not from scratch.
    - **Tools:** `process_ticket(ticket_id)`, `escalate_to_human(card{context,options,urgency})`, `resolve_escalation(choice, note)`, `resume_task(task_id, resolution)`, `annotate_playbook(pattern)`
    - **Why WebMCP:** Handoffs carry the *page's own live state* into the card — the human sees the exact screen the agent froze on; resume is a tool call, not prompt archaeology.
    - **Demo beat:** Refund request hits an edge case; booth flashes amber; human clicks "refund 50%"; agent finishes the workflow and logs the case as a new playbook rule.
    - **Risk:** Demo depends on a plausible fake ticket stream; script three good edge cases.

13. **Red-Pen Desk**
    - **Who/problem:** Support/community managers drowning in replies needing brand voice.
    - **Loop:** Agent drafts each reply as a sequence of typed edits (claims, tone shifts, commitments) rendered as inline diff chips; human taps accept/reject *per chip*, and rejected chips trigger a focused regeneration with the rejection reason attached.
    - **Tools:** `draft_reply(thread_id, goals)`, `list_edit_chips(reply_id)`, `accept_chip(chip_id)`, `reject_chip(chip_id, reason)`, `send_reply(final_text)`
    - **Why WebMCP:** Chip-level consent granularity only works when edits are structured tool outputs bound to DOM ranges; `send_reply` is the sole destructive gate.
    - **Demo beat:** Ten queued threads answered live; judge rejects one "we apologize" chip, agent rewrites bolder, sent inbox fills at superhuman speed.
    - **Risk:** Diff-chunking text sensibly (claim-level vs sentence-level) needs care.

14. **Fork in the Road**
    - **Who/problem:** Trip planners paralyzed by trade-offs; comparison today means ten tabs.
    - **Loop:** Human pins constraints on a live map; agent forks the itinerary into 2–3 divergent routes via tools, each rendered simultaneously as colored paths with cost/time/joy meters; human merges segments across forks (take day 2 from route B) and locks the winner.
    - **Tools:** `fork_itinerary(preference_vector)`, `mutate_segment(fork_id, segment_id, change)`, `merge_forks(segments_from_each)`, `price_fork(fork_id)`, `lock_itinerary(fork_id)`
    - **Why WebMCP:** Forks are parallel structured artifacts in one visible canvas — merging across branches is a typed operation no chat agent can offer against a normal site.
    - **Demo beat:** "Cheap vs. scenic vs. food-forward" spawns three glowing routes; judge splices the scenic coast into the cheap route and prices it in one click.
    - **Risk:** POI data licensing; use OpenStreetMap + curated seed cities.

15. **Ledger in a Vault**
    - **Who/problem:** People who want AI money insights but refuse to upload bank data.
    - **Loop:** CSV/bank export loads locally; agent requests *redacted aggregates* through tools (the vault layer strips names/merchant strings before anything reaches the model); recommendations appear as annotated transactions the human confirms or corrects, refining the local ruleset.
    - **Tools:** `request_aggregate(group_by, window)`, `flag_anomaly(txn_ids)`, `propose_budget(categories)`, `confirm_categorization(txn_id, category)`, `export_report(masked_level)`
    - **Why WebMCP:** The privacy firewall lives in the tool implementations — the agent literally cannot obtain PII because no tool returns it; everything runs offline-capable in-tab.
    - **Demo beat:** DevTools open showing zero network calls during analysis; agent finds a duplicate subscription and drafts a cancellation checklist.
    - **Risk:** Useful insight from aggregates alone is harder than raw-data analysis — design queries accordingly.

16. **Body Atlas**
    - **Who/problem:** Chronic-illness patients correlating symptoms/triggers; journals are siloed and private by necessity.
    - **Loop:** Daily check-ins paint a body map + log diet/sleep locally; agent hunts correlations through privacy-gated tools and proposes hypotheses as overlay heatmaps; human marks hypotheses plausible/nonsense, sharpening future queries.
    - **Tools:** `log_checkin(symptoms, factors)`, `query_correlation(factor, window)`, `render_body_heatmap(metric)`, `rate_hypothesis(id, verdict)`, `generate_doctor_summary(include_raw_bool)`
    - **Why WebMCP:** Correlation queries return structured geoms bound to the anatomical canvas; the doctor-summary tool is explicitly dual-mode (masked vs. full) with visible consent.
    - **Demo beat:** Six weeks of seeded logs; agent surfaces "gluten flare lag = 36h" heatmap; judge rates it, summary PDF generates masked.
    - **Risk:** Medical-claim framing — keep language strictly correlational, add disclaimers.

17. **Darkroom Gatekeeper**
    - **Who/problem:** Photographers with 50k local shots; cloud AI curation means uploading everything.
    - **Loop:** Agent may *request* access to specific frames via tools; a consent tray shows thumbnails only for approved batches; culls/ratings/stacks apply locally with a global revert. Unapproved frames stay grayed placeholders the agent knows exist but cannot see.
    - **Tools:** `list_library_manifest()`, `request_frame_access(frame_ids, purpose)`, `approve_access(request_id, ttl)`, `apply_cull(frame_ids, verdict)`, `undo_all_edits(since_batch)`
    - **Why WebMCP:** Access control *is* the tool surface — the manifest/consent/TTL pattern demonstrates agent permissions as first-class web UX.
    - **Demo beat:** Agent requests 200 frames "for blur detection," judge approves with a 10-minute TTL, culling completes, TTL expires, agent's later request auto-denied on screen.
    - **Risk:** File System Access API quirks across browsers; have a bundled sample library fallback.

18. **Provenance Press**
    - **Who/problem:** Newsrooms/fact-checkers; screenshots and quotes circulate with no verifiable history.
    - **Loop:** Writer pastes a draft; each quote/image embeds a provenance passport (hash, capture time, edit chain). Agent audits every asset via tools, flagging broken chains inline; fixes produce signed revisions, building an unbroken public changelog.
    - **Tools:** `attach_passport(asset_id, {source_hash, captured_at, chain})`, `audit_draft()`, `verify_chain(asset_id)`, `issue_correction(asset_id, delta)`, `publish_changelog()`
    - **Why WebMCP:** Verification must happen where the content lives — in-tab, against live assets — and corrections as structured signed deltas make the artifact self-auditing.
    - **Demo beat:** A doctored quote fails hash verification mid-article; red banner, one-click correction issues a signed delta; changelog renders.
    - **Risk:** Simplified hashing/signing is fine for MVP, but don't overclaim cryptographic guarantees.

19. **Claim Vine**
    - **Who/problem:** Students/analysts tracing whether a report's claims actually root in sources.
    - **Loop:** Claims are nodes on a vine canvas; agent crawls citations via tools, attaching source nodes with licenses and support-strength grades; human prunes dead vines (unsupported claims) which regenerates the bibliography live.
    - **Tools:** `add_claim(text)`, `trace_citation(claim_id, ref)`, `grade_support(source_id, claim_id)`, `prune_claim(claim_id, reason)`, `regenerate_bibliography(style)`
    - **Why WebMCP:** Graph mutations are typed and reversible; the agent explores links inside the browser session (cookies/paywalls included) that a backend crawler could never reach.
    - **Demo beat:** A seeded essay with two fabricated citations turns red in seconds; pruning cascades and the reference list rebuilds on camera.
    - **Risk:** Fetch/CORS limits on arbitrary sites; allow manual paste-fallback for source text.

20. **Ctrl-Z City**
    - **Who/problem:** Spreadsheet users terrified of letting agents touch their data.
    - **Loop:** Every agent operation enters an append-only op-log visualized as a city skyline (each op a building, color-coded by type); human clicks any building to preview the inverse diff and "unbuild" history back to that point, then re-branches from there.
    - **Tools:** `apply_op(op{cell_range, formula, transform})`, `preview_inverse(op_id)`, `checkpoint(label)`, `branch_from(op_id)`, `diff_branches(a,b)`
    - **Why WebMCP:** Reversibility is enforced by the tool contract (ops-only writes, no direct state access) — a governance model impossible to bolt onto Excel post-hoc.
    - **Demo beat:** Agent aggressively restructures a 5k-row budget in 15 seconds; judge gets cold feet, rolls back three buildings, branches, and compares both timelines side-by-side.
    - **Risk:** Op-log/inverse correctness for complex transforms; restrict the op vocabulary early.

21. **Deck Commits**
    - **Who/problem:** Teams co-authoring slide decks; agent edits feel like vandalism.
    - **Loop:** Agent works on a branch, producing commits rendered as before/after slide pairs in a review rail; human cherry-picks commits, requests variations per-slide (`redo(commit, style_hint)`), and merges to main with a talk-track timeline preserved.
    - **Tools:** `create_branch(deck_id)`, `commit_slide_edit(slide_id, edit_ops)`, `review_diff(commit_id)`, `cherry_pick(commit_id)`, `redo_with_hint(commit_id, hint)`
    - **Why WebMCP:** Slide edits as structured op-lists make diffs reviewable and granular — versus an agent screenshotting its way through Google Slides.
    - **Demo beat:** "Make deck investor-ready" yields 12 commits in 40 seconds; judge cherry-picks 9, rejects a garish redesign, merges, presents.
    - **Risk:** Rendering/diffing slides well; constrain to a custom block-based deck format.

22. **Earshot**
    - **Who/problem:** Screen-reader users; agent browsing today bypasses assistive tech entirely.
    - **Loop:** The page exposes semantic navigation tools that drive *both* the visual UI and a synchronized aria-live narration; user asks agent for a goal, agent emits a route of tool steps, each announced ("heading: Billing — focus moved"), and user can interrupt/redirect at any step.
    - **Tools:** `navigate_to_section(anchor)`, `summarize_region(region_id)`, `fill_field_semantic(field, value)`, `announce_progress(step, total)`, `abort_route()`
    - **Why WebMCP:** This inverts the usual story: tools aren't for the agent's benefit but to make agent behavior *legible to AT* — a co-designed channel neither DOM-scraping nor screen magnification provides.
    - **Demo beat:** Blindfolded judge completes checkout purely by audio-guided agent route, interrupting once to change shipping address mid-flow.
    - **Risk:** Genuinely testing with AT users in 8 days is hard; partner with a community tester early.

23. **One Step at a Time**
    - **Who/problem:** Users with ADHD/cognitive load issues facing long bureaucratic forms.
    - **Loop:** Agent decomposes any pasted form URL's structure into a stepped wizard with one question per screen, plain-language hints, and pre-filled suggestions shown as ghost text; human accepts field-by-field; a progress trail shows exactly what will submit before anything does.
    - **Tools:** `decompose_form(schema)`, `suggest_field(field_id, context_ok)`, `accept_suggestion(field_id)`, `explain_question(field_id, level)`, `stage_submission(payload)`
    - **Why WebMCP:** The wizard is generated from the target's declared structure and submits via a staged, reviewable payload — consent and comprehension at field granularity.
    - **Demo beat:** A nightmare 60-field benefits form becomes 90 calm seconds of one-tap accepts, with one "explain like I'm new" detour.
    - **Risk:** Depends on forms having sane markup; bundle 3 canonical target forms.

24. **Comfort Dials**
    - **Who/problem:** Low-vision, motion-sensitive, dyslexic users; accessibility settings are per-app mazes.
    - **Loop:** Agent inspects the current page through read-tools, proposes a named adaptation profile (contrast map, motion kill, spacing rhythm) rendered as toggle cards with live mini-previews; applying dials mutates the page via tools, fully reversible per dial, shareable as a link.
    - **Tools:** `inspect_page_barriers()`, `propose_dial(kind, params)`, `apply_dial(dial_id)`, `preview_dial(dial_id, seconds)`, `share_profile(profile_id)`
    - **Why WebMCP:** Adaptations must be applied *inside* the page's own render path — typed dials guarantee undo, whereas injected CSS hacks break silently.
    - **Demo beat:** A seizure-inducing marketing page tamed in three accepted dials; profile QR-shared to a second laptop which applies it instantly.
    - **Risk:** Dial implementations vary wildly across site architectures; curate supported patterns.

25. **Floorplan Parley**
    - **Who/problem:** Couples/teams designing a space together; one person always drives the mouse.
    - **Loop:** Both parties manipulate the same drag-and-drop floorplan; agent watches constraint violations (door swings, clearance, budget) live and intervenes only with *annotated suggestion ghosts* either human can snap-accept; every layout revision is a named, revertible checkpoint.
    - **Tools:** `validate_layout()`, `ghost_suggestion(move_ops, rationale)`, `snap_ghost(suggestion_id)`, `save_checkpoint(name)`, `restore_checkpoint(name)`
    - **Why WebMCP:** Ghosts are structured ops overlaid on shared canvas state — the agent participates in *spatial negotiation* without ever seizing the cursor.
    - **Risk:** CAD-lite collision/clearance logic is the bulk of engineering; keep furniture set small.

26. **Ink Loop**
    - **Who/problem:** Founders/marketers iterating logos; brief-to-designer loops take days.
    - **Loop:** Human sketches rough strokes or picks adjectives; agent mutates a live SVG via generation tools, each candidate pinned beside ancestors in a visible family tree with inherited-node highlighting; human grafts parts (this icon + that palette) and the loop continues; infinite undo via tree.
    - **Tools:** `generate_variant(parent_ids, directives)`, `graft_elements(child_parts)`, `recolor(palette_tokens)`, `critique(svg_id, rubric)`, `pin_favorite(svg_id)`
    - **Why WebMCP:** SVG-as-schema means variants are structured, diffable, and recombinable — the family-tree UI is only possible because generations are typed artifacts.
    - **Demo beat:** "Fierce but friendly, works tiny" produces eight cousins in a minute; judge grafts wings from cousin B onto cousin F and exports.
    - **Risk:** LLM SVG output quality is hit-or-miss; lean on constrained primitives + deterministic transforms.

27. **Chartwright**
    - **Who/problem:** Analysts who know their data but not visualization grammar.
    - **Loop:** Dataset loads visibly as a scrollable table; agent proposes transformations (pivot, filter, encode) as chained tool calls each rendering an instant chart thumbnail; human drags thumbnails into a storyboard, tweaks any link's params, and exports the whole narrative.
    - **Tools:** `load_dataset(source)`, `transform(op_pipeline)`, `render_chart(spec)`, `narrate_insight(chart_id)`, `export_storyboard(charts)`
    - **Why WebMCP:** The transform pipeline is inspectable and editable *between* steps — the human steers mid-analysis rather than approving a black-box report.
    - **Demo beat:** Messy sales CSV → five-chart story ("churn hides in March") built interactively in 100 seconds.
    - **Risk:** Avoiding generic-dashboard vibes; frame everything as narrative storyboard, not BI tool.

28. **Duet Machine**
    - **Who/problem:** Non-musicians who want the joy of jamming; DAWs intimidate.
    - **Loop:** Human lays down a simple drum pulse on a visible step sequencer; agent joins via tools — bassline, chords, fills — each addition lighting up its lanes and tagged with a vibe label; human mutes/rerolls any lane, locks favorites, and the arrangement evolves turn-by-turn like a conversation.
    - **Tools:** `listen_to_pattern(tracks)`, `add_lane(instrument, notes, vibe)`, `vary_lane(lane_id, directive)`, `mute_lane(lane_id)`, `bounce_arrangement(name)`
    - **Why WebMCP:** Musical responses arrive as structured note events bound to sequencer lanes — reroll/mute/lock is conversational *musical* interaction, not prompt-and-pray audio dumps.
    - **Demo beat:** Judge taps four kicks; agent drops a funk bassline; judge rerolls twice, locks it, agent answers with claps — 30-second groove born on stage.
    - **Risk:** Timing/latency polish with WebAudio; pre-quantize everything.

29. **Rules Lawyer**
    - **Who/problem:** Tabletop groups mid-game disputes; rulebooks are 40 pages and nobody agrees.
    - **Loop:** Group ingests a rulebook (or uses bundled classics); the live game board tracks state via structured moves; any player summons the lawyer, which cites exact rule passages as overlay cards on the disputed piece; house-rule overrides are logged as amendments with rollback.
    - **Tools:** `register_move(piece, action, params)`, `consult_rules(query, board_context)`, `cite_rule(passages, dispute_id)`, `amend_house_rule(rule, scope)`, `revert_move(move_id)`
    - **Why WebMCP:** Rulings bind to *board state the page already knows*, so citations come contextualized ("this exact scenario") — retrieval plus live state beats a chat window with a PDF.
    - **Demo beat:** Two judges dispute an ambiguous capture; lawyer highlights clause 6.3 on the contested square; house-rule amendment passes 2-0; game resumes.
    - **Risk:** Rulebook parsing quality; ship with 3 pre-indexed public-domain games.

30. **Tavern of Tongues**
    - **Who/problem:** Language learners who freeze in conversation; apps drill but never converse.
    - **Loop:** Learner bargains in their target language with agent-run shopkeepers (each an NPC with goals/quirks exposed as structured state — patience meter, hidden discount thresholds); mistakes trigger inline grammar chips the learner accepts to repair the utterance; successful deals unlock harder taverns.
    - **Tools:** `speak_utterance(text, intended_meaning)`, `offer_grammar_repair(chip)`, `npc_respond(npc_id, mood_shift)`, `negotiate_deal(npc_id, offer)`, `adjust_difficulty(level)`
    - **Why WebMCP:** NPC inner state is queryable structure, so the agent's role-play stays coherent and fair across a session, while repairs are consentable micro-actions — a tutoring loop, not a chatbot skin.
    - **Demo beat:** Judge haggles in rusty Spanish; two accepted repair chips later, they win a 20% discount and the innkeeper's respect meter visibly rises.
    - **Risk:** Grammar-correction accuracy across languages; scope launch to one well-tested language.

---

## TOP 5

1. **20. Ctrl-Z City** — Makes agent reversibility visceral and trustworthy in one glance; the governance story judges didn't know they wanted.
2. **1. Blind Cartographer** — Tool schemas literally *are* the game; the most original demonstration that structure enables play, not just productivity.
3. **12. Escalation Booth** — Crisp agent↔human handoff loop with state-carrying cards; solves a real automation gap with a clean 3-minute arc.
4. **8. Roommate Treaty** — Multi-tab privacy + consent + signing in one room; cheap to build, universally relatable, demo-friendly.
5. **22. Earshot** — Highest impact-per-line-of-code: reframes WebMCP as an accessibility channel, a judging-category slam dunk if the blindfolded-demo lands.
