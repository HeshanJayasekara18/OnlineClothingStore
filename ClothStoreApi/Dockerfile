# Use ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Use SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ClothStoreApi.csproj", "."]
RUN dotnet restore "ClothStoreApi.csproj"

COPY . .
RUN dotnet publish "ClothStoreApi.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Non-root user
RUN adduser --disabled-password --home /app --gecos '' appuser && chown -R appuser /app
USER appuser

# Keep container running via dotnet entrypoint
ENTRYPOINT ["dotnet", "ClothStoreApi.dll"]
