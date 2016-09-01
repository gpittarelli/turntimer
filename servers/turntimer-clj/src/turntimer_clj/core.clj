(ns turntimer-clj.core
  (:require [environ.core :refer [env]]
            [org.httpkit.server :refer [run-server]]))

(defn app [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})

(defn -main [& args]
  (run-server app {:port (or (env :port 8080))}))
