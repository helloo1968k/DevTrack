# =========================
# 1. Build React frontend
# =========================
FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY FrontEnd/package*.json ./
RUN npm ci

COPY FrontEnd/ ./

# Build React
# api.ts uses '' when VITE_API_URL is not provided,
# so production requests go to /api/...
ENV VITE_API_URL=""

RUN npm run build


# =========================
# 2. Build .NET backend
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build

WORKDIR /src

# Copy project files first for better Docker layer caching
COPY BackEnd/src/DevTracker.Api/DevTracker.Api.csproj BackEnd/src/DevTracker.Api/
COPY BackEnd/src/DevTracker.Application/DevTracker.Application.csproj BackEnd/src/DevTracker.Application/
COPY BackEnd/src/DevTracker.Domain/DevTracker.Domain.csproj BackEnd/src/DevTracker.Domain/
COPY BackEnd/src/DevTracker.Infrastructure/DevTracker.Infrastructure.csproj BackEnd/src/DevTracker.Infrastructure/
# Restore dependencies
RUN dotnet restore BackEnd/src/DevTracker.Api/DevTracker.Api.csproj

# Copy the remaining backend source
COPY BackEnd/ BackEnd/

# Publish API
RUN dotnet publish BackEnd/src/DevTracker.Api/DevTracker.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


# =========================
# 3. Final production image
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copy published .NET application
COPY --from=backend-build /app/publish .

# Copy React production build into ASP.NET Core wwwroot
COPY --from=frontend-build /frontend/dist ./wwwroot

# ASP.NET Core listens on port 8080
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "DevTracker.Api.dll"]