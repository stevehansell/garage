# A sample Guardfile
# More info at https://github.com/guard/guard#readme

# Run JS and CoffeeScript files in a typical Rails 3.1 fashion, placing Underscore templates in app/views/*.jst
# Your spec files end with _spec.{js,coffee}.

spec_location = "test/specs/%s_test"

# uncomment if you use NerdCapsSpec.js
# spec_location = "spec/javascripts/%sSpec"
# 
group 'all' do
  guard 'jasmine-headless-webkit', :jasmine_config => 'test/jasmine.yml', :all_on_start => true do
    watch(%r{^(.*)\.js$}) { |m| newest_js_file(spec_location % m[1]) }
    watch(%r{^test/specs/(.*)_test\..*}) { |m| newest_js_file(spec_location % m[1]) }
  end
end