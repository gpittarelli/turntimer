(ns turntimer-clj.core
  (:require [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]
            [bidi.ring :refer [make-handler]]
            [ring.util.response :refer [not-found response]]
            [ring.middleware.json :refer [wrap-json-response wrap-json-body]]))

(def groups (atom {}))

(defn index [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})

(defn get-group [{{id :id} :route-params :as req}]
  (let [group (get @groups id)]
    (if group
      (response group)
      (not-found "Group does not exist.\n"))))

(defn create-group [{{id :id} :route-params :as req}]
  (swap! groups assoc id {:id id})
  (get-group req))

(def api-routes
  [[["group/" :id] {:post create-group :get get-group}]])

(def app
  (-> (make-handler ["/api/" api-routes])
      wrap-json-response
      wrap-json-body))

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
