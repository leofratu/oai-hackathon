# Demo script

Target duration: 2 minutes 40 seconds. Keep the final upload below 3 minutes.

## 0:00-0:15

Picture: Label Loop hero, model metrics, and the native WebMCP badge.

Voiceover: "Label Loop is a working online classifier inside a web page. It starts with nine support tickets and learns new billing, bug, and access examples during the session. No backend or model API is involved."

## 0:15-0:35

Picture: Open the browser's site tool list and show all nine names. Return to the page proof card.

Voiceover: "The page registers nine tools through document model context. The browser agent receives typed operations for training, evaluation, diagnostics, and inference. It can query the model without interpreting the page layout."

## 0:35-0:58

Picture: Change the source slate to `Labeled local handler replay`, run the first turn, and show the trace and entropy-ranked cards.

Voiceover: "For this recorded run, I use the labeled local replay so each step is predictable and easy to inspect. It calls the same production handlers. The first calls read aggregate state and rank the unlabeled pool by normalized predictive entropy. High entropy means the class probabilities are close, so these tickets are useful candidates for human review."

## 0:58-1:22

Picture: The replay calls `queue_label_review` for two tickets. Show the review panel and select the correct label on each card.

Voiceover: "The replay requests two labels, but the tool schema has no label field. I assign the authoritative categories on the page. Until I do that, the training tool rejects these samples. Agent predictions cannot become training truth without this human action."

## 1:22-1:48

Picture: Call `train_confirmed_batch`, `evaluate_model`, `inspect_training_history`, and `inspect_model_diagnostics`. Hold on updated example count, learned features, confusion matrix, calibration, and history.

Voiceover: "Now the model increments its document and token counts with my confirmed examples. Predictions are recalculated immediately. Diagnostics expose one-vs-rest token weights, aggregate confusion counts, confidence calibration, log loss, and per-class scores without returning individual holdout answers."

## 1:48-2:12

Picture: Call `propose_model_config`. Show current settings beside the pending proposal, then select `Accept settings`.

Voiceover: "The agent can recommend a different Laplace smoothing value and low-confidence review threshold. The proposal is visible and has no effect until I accept it. After approval, the threshold controls whether new predictions are routed to human review."

## 2:12-2:31

Picture: Classify two new text examples, one confident and one ambiguous. Show the decision text.

Voiceover: "I can test the current classifier with new text. Confident results can be routed, while uncertain results are marked for review. The model, approval state, and call history remain on one shared page."

## 2:31-2:40

Picture: Full page, then live URL and repository URL.

Voiceover: "Label Loop is deployed as a static app. The live site, full source, tool contracts, and tests are ready for judge review."

## Production notes

- Record native discovery in a browser that exposes WebMCP.
- Keep the sidebar hidden after the native tool list shot.
- Capture at 1920 by 1080 and 30 frames per second.
- Use direct cuts and readable cursor movement.
- Mix narration near -16 LUFS with true peak below -1.5 dB.
- Export H.264 video with AAC audio and `faststart` enabled.
- Burn in reviewed captions, then upload to YouTube as public or unlisted.
- Do not present local replay as native agent footage.
