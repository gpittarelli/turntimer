(ns turntimer-clj.core
  (:require [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]
            [bidi.ring :refer [make-handler]]
            [ring.util.response :refer [not-found response]]
            [ring.middleware.json :refer [wrap-json-response wrap-json-body]]
            [ring.middleware.params :refer [wrap-params]]))

;; comparator for pairs (aka [some-value
;; some-ordering-value])
(defn compare-pair [[a b] [a' b']]
  (let [c (compare b b')]
    (if-not (zero? c)
      c
      (compare a a'))))

(defn- millis [] (System/currentTimeMillis))

(def groups (atom {}))

(defn index [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})

(defn get-group [{{id :id} :route-params :as req}]
  (let [group (get @groups id)]
    (if group
      (let [{:keys [players start-time]} group
            dt (- (millis) start-time)
            cnt-players (count players)
            current-turn (when-not (zero? cnt-players)
                           (mod (quot dt 1000) cnt-players))]
        (-> group
            (assoc :current-turn current-turn)
            (update :players (partial map first))
            response))
      (not-found "Group does not exist.\n"))))

(defn create-group [{{id :id} :route-params :as req}]
  (swap! groups assoc id
         {:id id
          :players (sorted-set-by (comp < second))
          :start-time (millis)})
  (get-group req))

(defn add-player
  [{{group-id :id player-name :name} :route-params :as req}]
  (swap! groups update-in [group-id :players] conj player-name)
  (get-group req))

(def api-routes
  [[["group/" :id] [[["/player/" :name] {:post add-player}]
                    [#{"/" ""} {:post create-group :get get-group}]]]])

(def app
  (-> (make-handler ["/api/" api-routes])
      wrap-json-response
      wrap-json-body
      wrap-params))

(defonce server (atom nil))

(defn stop-server []
  (when-not (nil? @server)
    ;; graceful shutdown: wait 100ms for existing requests to be finished
    ;; :timeout is optional, when no timeout, stop immediately
    (@server :timeout 100)
    (reset! server nil)))

(defn -main [& args]
  (let [port (or (env :port 8080))]
    (reset! server (run-server #'app {:port port}))
    (println "Lisenting on port" port)))
