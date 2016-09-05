(ns turntimer-clj.core
  (:require [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]
            [bidi.ring :refer [make-handler]]))

(defn index [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})

(defn group [req]
  (println req)
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello group"})

; "/group" {["/" :id] group}
(def routes
  [["group"
    {["/" id] group}]
   [true index]])

(def app (-> (make-handler ["/" routes])))

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
