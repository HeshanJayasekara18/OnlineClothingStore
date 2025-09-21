# -------------------
# Build Stage
# -------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["ClothStoreApi.csproj", "./"]
RUN dotnet restore "./ClothStoreApi.csproj"

# Copy everything else and publish
COPY . .
RUN dotnet publish "ClothStoreApi.csproj" -c Release -o /app/publish

# -------------------
# Runtime Stage
# -------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published files
COPY --from=build /app/publish .

# Ensure ASP.NET listens on port 8080 (required by EB)
ENV ASPNETCORE_URLS=http://+:8080

# Expose port 8080 for EB
EXPOSE 8080

# Optional: add a healthcheck so EB can monitor container
HEALTHCHECK CMD curl --fail http://localhost:8080 || exit 1

# Start the application
ENTRYPOINT ["dotnet", "ClothStoreApi.dll"]
