(ns turntimer-clj.core
  (:require [clojure.string :as string]
            [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]
            [bidi.ring :refer [make-handler]]
            [ring.util.response :refer [not-found response]]
            [ring.middleware.json :refer [wrap-json-response wrap-json-body]]
            [ring.middleware.params :refer [wrap-params]]))

(defn- str->int [str] (->> str (re-find #"\d+") read-string))

(defn- camel-case
  "converts some-snakecase-name to someSnakecaseName"
  [s]
  (let [[x & xs] (string/split s #"-")]
    (str x (apply str (map string/capitalize xs)))))

(defn- map-keys [f o] (->> o (map (fn [[k v]] [(f k) v])) (into {})))

;; comparator for pairs (aka [some-value
;; some-ordering-value])
(defn- compare-pair [[a b] [a' b']]
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
      (let [{:keys [users start-time turn-time]} group
            dt (- (millis) start-time)
            cnt-users (count users)
            time-left (quot dt (* 1000 turn-time))
            active-turn (when-not (zero? cnt-users)
                           (mod time-left cnt-users))]
        (-> group
            (assoc :active-turn active-turn
                   :time-left time-left)
            (update :users (partial map first))
            (->> (map-keys (comp camel-case name)))
            response))
      (not-found "Group does not exist.\n"))))

(defn create-group
  [{{id :id} :route-params
    {turn-time "turnTime"} :query-params
    :as req}]
  (swap! groups assoc id
         {:id id
          :turn-time (if turn-time
                       (str->int turn-time)
                       60)
          :users (sorted-set-by compare-pair)
          :start-time (millis)})
  (get-group req))

(defn add-player
  [{{group-id :id player-name :name} :route-params :as req}]
  (swap! groups update-in [group-id :users]
         #(clojure.set/select (fn [[name]] (not= name player-name)) %))
  (swap! groups update-in [group-id :users] conj [player-name (millis)])
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

;; Local Variables:
;; cider-refresh-after-fn: "turntimer-clj.core/-main"
;; cider-refresh-before-fn: "turntimer-clj.core/stop-server"
;; End:
