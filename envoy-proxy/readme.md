## Uninstall Envoy Proxy
```bash
helm uninstall envoy-proxy
```

## Install Envoy Proxy
```bash
helm install envoy-proxy ./envoy-proxy/helm
```

## port-forward
```bash
kill $(lsof -t -i:3000)
kubectl port-forward svc/envoy-proxy 3000:3000
```
