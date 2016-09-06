(defproject turntimer-clj "0.1.0-SNAPSHOT"
  :description "Turntimer API server"
  :url "http://example.com/FIXME"
  :license {:name "GNU General Public License v3.0"
            :url "http://www.gnu.org/licenses/gpl-3.0.txt"}
  :main turntimer-clj.core
  :dependencies
  [[org.clojure/clojure "1.8.0"]
   [http-kit "2.1.18"]
   [environ "1.1.0"]
   [bidi "2.0.10"]
   [ring/ring-json "0.4.0"]
   [ring/ring-core "1.5.0"]])
