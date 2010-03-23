task :default => [:node_tests, :error_check, :run_tests]

task :node_tests do
  sh "node tests/console_test_driver.js tests/meta.js tests/test_sanity.js"
end

task :error_check do
  sh "compilejs --js src/TripleStore.js --js tests/meta.js --js tests/test_sanity.js --jscomp_error invalidCasts --warning_level VERBOSE --externs jgd.externs.js >/dev/null"
end

task :run_tests do
  sh "jstdServer ; sleep 3 ; open http://localhost:4224/capture" unless `nc -z localhost 4224` =~ /succeeded!/
  sh "testjstd"
end
