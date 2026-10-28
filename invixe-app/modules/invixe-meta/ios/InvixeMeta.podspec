Pod::Spec.new do |s|
  s.name = 'InvixeMeta'
  s.version = '1.0.0'
  s.summary = 'Consent-gated Meta lifecycle and local diagnostics'
  s.description = s.summary
  s.license = { :type => '0BSD' }
  s.author = 'Invixe'
  s.homepage = 'https://github.com/GabayBen812/Invixe'
  s.source = { :git => s.homepage }
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.4'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'FBSDKCoreKit', '~> 18.0'
  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
