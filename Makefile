stage-release:
	wrap () { curl -v -d "{\"ref\":\"main\",\"inputs\":{\"personal_token\":\"${GITHUB_TOKEN}\"}}" -H "Accept: application/vnd.github.v3+json" -H "Authorization: token ${GITHUB_TOKEN}" -H "Content-Type: application/json;charset=utf-8" "https://api.github.com/repos/Jose-offshrly/ai-proxy/actions/workflows/global-create-staging-release.yml/dispatches"; }; wrap
