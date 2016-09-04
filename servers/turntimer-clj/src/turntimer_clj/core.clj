(ns turntimer-clj.core
  (:require [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]
            [bidi.ring :refer [make-handler]]))

(defn index [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})

(def routes
  ["/" index])

(def app (-> (make-handler routes)))

(defn -main [& args]
  (let [port (or (env :port 8080))]
    (run-server app {:port port})
    (println "Lisenting on port" port)))
