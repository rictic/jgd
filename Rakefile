task :default => [:error_check]

task :error_check do
  sh "compilejs --js src/TripleStore.js --jscomp_error invalidCasts --warning_level VERBOSE --externs jgd.externs.js >/dev/null"
end
