# Use SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["ClothStoreApi.csproj", "./"]
RUN dotnet restore "ClothStoreApi.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "ClothStoreApi.csproj" -c Release -o /app/build
RUN dotnet publish "ClothStoreApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Copy the published app
COPY --from=build /app/publish .

# Create a non-root user and set permissions
RUN adduser --disabled-password --home /app --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Set the entry point
ENTRYPOINT ["dotnet", "ClothStoreApi.dll"]
